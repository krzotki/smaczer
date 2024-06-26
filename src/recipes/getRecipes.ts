import { MongoClient, ObjectId } from "mongodb";
import { RecipeType } from "./types";
import { dbName, dbUrl, pineconeIndex } from "./config";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RandomLCG } from "@/utils/random";
import { OpenAI } from "openai";
import {
  getIngredientsPrice,
  ingredientsToString,
  updateRecipe,
} from "./addRecipe";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { COLLECTION_WEEKLY_RECIPES } from "./rollRecipes";

const MAX_PAGE_SIZE = 21;
export const COLLECTION_ALL_RECIPES = "recipes";

export type RecipeListItem = Pick<
  RecipeType,
  "_id" | "id" | "name" | "photoPath" | "ingredientsCost"
> & {
  isInWeekly?: boolean;
};

export const getAllRecipes = (collection: string) => {
  return new Promise<RecipeType[]>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then((client) => {
        const db = client.db(dbName);

        // Read Data from a Collection
        db.collection(collection)
          .find({})
          .toArray()
          .then((items) => {
            resolve(
              items.map(({ _id, ...rest }) => ({
                ...(rest as RecipeType),
                _id: _id.toString(),
              }))
            );
            client.close(); // Close the connection after the operation is complete
          })
          .catch((error) => {
            reject(error);
            client.close(); // Also close the connection in case of an error
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getRecipes = (page: number) => {
  return new Promise<RecipeListItem[]>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        const db = client.db(dbName);

        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((c) => c.name);

        if (!collectionNames.includes(COLLECTION_ALL_RECIPES)) {
          await db.createCollection(COLLECTION_ALL_RECIPES);
        }

        if (!collectionNames.includes(COLLECTION_WEEKLY_RECIPES)) {
          await db.createCollection(COLLECTION_WEEKLY_RECIPES);
        }

        const weekly = await getAllRecipes(COLLECTION_WEEKLY_RECIPES);

        // Read Data from a Collection
        db.collection(COLLECTION_ALL_RECIPES)
          .find({})
          .sort({
            _id: 1,
          })
          .skip((page - 1) * MAX_PAGE_SIZE)
          .limit(MAX_PAGE_SIZE)
          .toArray()
          .then((items) => {
            resolve(
              items.map<RecipeListItem>((item) => ({
                _id: item._id.toString(),
                id: item.id,
                name: item.name,
                photoPath: item.photoPath,
                ingredientsCost: item.ingredientsCost,
                isInWeekly: !!weekly.find(
                  (recipe) => recipe._id === item._id.toString()
                ),
              }))
            );
            client.close(); // Close the connection after the operation is complete
          })
          .catch((error) => {
            reject(error);
            client.close(); // Also close the connection in case of an error
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getRecipe = (_id: string) => {
  return new Promise<RecipeType>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then((client) => {
        const db = client.db(dbName);

        // Read Data from a Collection
        db.collection(COLLECTION_ALL_RECIPES)
          .findOne({
            _id: new ObjectId(_id),
          })
          .then((item) => {
            if (item) {
              const { _id, ...rest } = item;
              resolve({
                ...(rest as RecipeType),
                _id: _id.toString(),
              });
            } else {
              reject("Recipe not found");
            }
            client.close();
          })
          .catch((error) => {
            reject(error);
            client.close();
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const createDocumentsFromRecipes = (recipes: RecipeType[]) =>
  recipes.map(
    (recipe) =>
      new Document({
        pageContent: `
        ${recipe.name}
        ${ingredientsToString(recipe)}
      `,
        metadata: {
          _id: recipe._id.toString(),
          id: recipe.id,
          name: recipe.name,
          photoPath: recipe.photoPath,
        },
      })
  );

export const indexRecipes = async () => {
  const recipes = await getAllRecipes(COLLECTION_ALL_RECIPES);
  return await PineconeStore.fromDocuments(
    createDocumentsFromRecipes(recipes),
    new OpenAIEmbeddings(),
    {
      pineconeIndex,
      maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    }
  );
};

export const getRecipesBySimilarity = async (
  ingredients: string,
  count: number
): Promise<RecipeListItem[]> => {
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  const weekly = await getAllRecipes(COLLECTION_WEEKLY_RECIPES);
  const selected = await vectorStore.similaritySearch(ingredients, count);

  const withData = await Promise.all(
    selected.map(async (doc) => {
      const recipe = doc.metadata as RecipeListItem;
      const isInWeekly = !!weekly.find(
        (r) => r._id === recipe._id.toString()
      );

      if (recipe.ingredientsCost) {
        return {
          ...recipe,
          isInWeekly
        };
      }
      const fullRecipe = await getRecipe(recipe._id);
      return {
        ...recipe,
        ingredientsCost: fullRecipe.ingredientsCost,
        isInWeekly
      };
    })
  );

  return withData;
};
