import { MongoClient, ObjectId } from "mongodb";
import { RecipeType } from "./types";
import { dbName, dbUrl } from "./config";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RandomLCG } from "@/utils/random";

const MAX_PAGE_SIZE = 21;
export const COLLECTION_ALL_RECIPES = "recipes";

export type RecipeListItem = Pick<
  RecipeType,
  "_id" | "id" | "name" | "photoPath"
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

export const getRecipesBySimilarity = async (
  ingredients: string,
  count: number
) => {
  const recipes = await getAllRecipes(COLLECTION_ALL_RECIPES);
  const vectorStore = await MemoryVectorStore.fromTexts(
    recipes.map((recipe, index) => {
      const text = `${recipe.name}
        ${recipe.ingredients
          .map(({ items }) => items.map((item) => item.name).join(","))
          .join(",")}`;
      if (index === 0) console.log({ text });
      return text;
    }),
    recipes.map((recipe) => ({
      _id: recipe._id.toString(),
      id: recipe.id,
      name: recipe.name,
      photoPath: recipe.photoPath,
    })),
    new OpenAIEmbeddings()
  );

  // const resultOne = await vectorStore.similaritySearch(ingredients, count);
  const resultTwo = await vectorStore.similaritySearchWithScore(
    ingredients,
    count * 2
  );

  const averageScore =
    resultTwo.reduce((prev, [, score]) => prev + score, 0) / resultTwo.length;
  console.log({ averageScore });
  return resultTwo
    .filter(([, score]) => score > averageScore)
    .slice(0, count - 1)
    .map(([document, score]) => document.metadata) as RecipeListItem[];
};
