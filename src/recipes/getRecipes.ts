import { MongoClient, ObjectId } from "mongodb";
import { RecipeType, User } from "./types";
import { dbName, dbUrl, pineconeIndex } from "./config";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RandomLCG } from "@/utils/random";
import { OpenAI } from "openai";

import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { COLLECTION_WEEKLY_RECIPES } from "./rollRecipes";
import { getUsersThatAreSharingWithMe } from "@/auth";
import { Session } from "next-auth";
import { ingredientsToString } from "./utils";
import { removeWeeklyRecipe } from "./removeRecipe";

const MAX_PAGE_SIZE = 21;
export const COLLECTION_ALL_RECIPES = "recipes";

export type RecipeListItem = Pick<
  RecipeType,
  | "_id"
  | "id"
  | "name"
  | "photoPath"
  | "ingredientsCost"
  | "owner"
  | "originalId"
> & {
  isInWeekly?: boolean;
};

export const getAllRecipes = (collection: string, userId?: string) => {
  return new Promise<RecipeType[]>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then((client) => {
        const db = client.db(dbName);

        // Read Data from a Collection
        db.collection(collection)
          .find(userId ? { owner: userId } : {})
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
        try {
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
          const items = await db
            .collection(COLLECTION_ALL_RECIPES)
            .find({})
            .sort({ _id: 1 })
            .skip((page - 1) * MAX_PAGE_SIZE)
            .limit(MAX_PAGE_SIZE)
            .toArray();

          resolve(
            items.map<RecipeListItem>((item) => ({
              _id: item._id.toString(),
              id: item.id,
              name: item.name,
              photoPath: item.photoPath,
              ingredientsCost: item.ingredientsCost,
              isInWeekly: !!weekly.find(
                (recipe) => recipe.originalId === item._id.toString()
              ),
              originalId: item._id.toString(),
            }))
          );
        } finally {
          client.close(); // Close the connection after the operation is complete
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getRecipe = (_id: string) => {
  return new Promise<RecipeType | null>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          // Read Data from a Collection
          const item = await db
            .collection(COLLECTION_ALL_RECIPES)
            .findOne({ _id: new ObjectId(_id) });

          if (item) {
            const { _id, ...rest } = item;
            resolve({
              ...(rest as RecipeType),
              _id: _id.toString(),
            });
          } else {
            resolve(null);
          }
        } finally {
          client.close();
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getWeeklyRecipe = (_id: string, owner: string) => {
  return new Promise<RecipeType | null>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          // Read Data from a Collection
          const item = await db
            .collection(COLLECTION_WEEKLY_RECIPES)
            .findOne({ _id: new ObjectId(_id), owner });

          if (item) {
            const { _id, ...rest } = item;
            resolve({
              ...(rest as RecipeType),
              _id: _id.toString(),
            });
          } else {
            resolve(null);
          }
        } finally {
          client.close();
        }
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
  count: number,
  session: Session | null
): Promise<RecipeListItem[]> => {
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  let weekly = await getAllRecipes(
    COLLECTION_WEEKLY_RECIPES,
    session?.user?.id
  );

  if (session?.user?.sharedWithMe?.length) {
    weekly = await getAllRecipes(
      COLLECTION_WEEKLY_RECIPES,
      session.user.sharedWithMe[0].id
    );
  }

  const selected = await vectorStore.similaritySearch(ingredients, count);

  const withData = await Promise.all(
    selected.map(async (doc) => {
      const recipe = doc.metadata as RecipeListItem;

      const isInWeekly = !!weekly.find(
        (r) => r.originalId === recipe._id.toString()
      );

      const fullRecipe = await getRecipe(recipe._id);

      if (!fullRecipe) {
        // await vectorStore.delete({
        //   ids: [doc.metadata.id],
        // });
        return null;
      }

      return {
        ...fullRecipe,
        originalId: fullRecipe._id,
        isInWeekly,
      };
    })
  );

  return withData.filter(filterTruthy);
};

export const filterTruthy = <T>(value: T | null): value is T => value !== null;

export const getMappedWeeklyRecipes = async (userId?: string) => {
  const weekly = await getAllRecipes(COLLECTION_WEEKLY_RECIPES, userId);
  const mapped = await Promise.all(
    weekly.map(async (recipe) => {
      const fullRecipe = await getRecipe(recipe.originalId);
      if (!fullRecipe) {
        await removeWeeklyRecipe(recipe._id, userId as string);
        return null;
      }
      return {
        ...fullRecipe,
        ...recipe,
      };
    })
  );

  return mapped.filter(filterTruthy);
};
