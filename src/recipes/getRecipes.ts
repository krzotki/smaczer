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

const MAX_PAGE_SIZE = 21;
export const COLLECTION_ALL_RECIPES = "recipes";

export type RecipeListItem = Pick<
  RecipeType,
  "_id" | "id" | "name" | "photoPath" | "ingredientsCost"
>;

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
      .then((client) => {
        const db = client.db(dbName);

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

export const getRecipe = (id: string) => {
  return new Promise<RecipeType>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then((client) => {
        const db = client.db(dbName);

        // Read Data from a Collection
        db.collection(COLLECTION_ALL_RECIPES)
          .findOne({
            _id: new ObjectId(id),
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

  const selected = await vectorStore.similaritySearch(ingredients, count);

  const withCost = await Promise.all(
    selected.map(async (doc) => {
      const recipe = doc.metadata as RecipeListItem;
      if (recipe.ingredientsCost) {
        return recipe;
      }
      const fullRecipe = await getRecipe(recipe._id);
      return {
        ...recipe,
        ingredientsCost: fullRecipe.ingredientsCost,
      };
    })
  );

  return withCost;
};
