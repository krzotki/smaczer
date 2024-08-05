import { MongoClient, ObjectId } from "mongodb";
import { dbName, dbUrl } from "./config";
import { RandomLCG } from "@/utils/random";
import { COLLECTION_ALL_RECIPES } from "./getRecipes";
import { RecipeType } from "./types";
import {
  getIngredientsPrice,
  ingredientsToString,
  updateRecipe,
} from "./addRecipe";

export const COLLECTION_WEEKLY_RECIPES = "recipes_weekly";

const rng = new RandomLCG(Date.now());

export const rollOneRecipe = (userId: string) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          const collections = await db.listCollections().toArray();
          const collectionNames = collections.map((c) => c.name);
          const collectionName = COLLECTION_WEEKLY_RECIPES;

          if (!collectionNames.includes(collectionName)) {
            await db.createCollection(collectionName);
            console.log(`Collection ${collectionName} created`);
          }

          const recipes = await db
            .collection(COLLECTION_ALL_RECIPES)
            .find({})
            .toArray()
            .then((items) =>
              items.map(({ _id, ...rest }) => ({
                ...(rest as RecipeType),
                _id: _id.toString(),
              }))
            );

          const randomRecipe = rng.pickRandomElements(recipes, 1)[0];

          if (!randomRecipe.ingredientsCost) {
            const cost = await getIngredientsPrice(ingredientsToString(randomRecipe));
            await updateRecipe(COLLECTION_ALL_RECIPES, {
              ...randomRecipe,
              ingredientsCost: cost,
            });
            await updateRecipe(COLLECTION_WEEKLY_RECIPES, {
              ...randomRecipe,
              ingredientsCost: cost,
            });
          }

          const result = await db.collection(COLLECTION_WEEKLY_RECIPES).insertOne({
            ...randomRecipe,
            _id: new ObjectId(randomRecipe._id),
            owner: userId,
          });

          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          client.close(); // Close the connection after the operation is complete
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const rollWeeklyRecipes = (userId: string) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          const collections = await db.listCollections().toArray();
          const collectionNames = collections.map((c) => c.name);
          const collectionName = COLLECTION_WEEKLY_RECIPES;

          if (!collectionNames.includes(collectionName)) {
            await db.createCollection(collectionName);
            console.log(`Collection ${collectionName} created`);
          }

          // Delete all previous weekly recipes
          await db.collection(COLLECTION_WEEKLY_RECIPES).deleteMany({ owner: userId });

          const recipes = await db
            .collection(COLLECTION_ALL_RECIPES)
            .find({})
            .toArray()
            .then((items) =>
              items.map(({ _id, ...rest }) => ({
                ...(rest as RecipeType),
                _id: _id.toString(),
              }))
            );

          const randomRecipes = rng.pickRandomElements(recipes, 10);

          for (const recipe of randomRecipes) {
            if (!recipe.ingredientsCost) {
              const cost = await getIngredientsPrice(ingredientsToString(recipe));
              await updateRecipe(COLLECTION_ALL_RECIPES, {
                ...recipe,
                ingredientsCost: cost,
              });
              await updateRecipe(COLLECTION_WEEKLY_RECIPES, {
                ...recipe,
                ingredientsCost: cost,
              });
            }
          }

          const result = await db.collection(COLLECTION_WEEKLY_RECIPES).insertMany(
            randomRecipes.map((recipe) => ({
              ...recipe,
              _id: new ObjectId(recipe._id),
              owner: userId,
            }))
          );

          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          client.close(); // Close the connection after the operation is complete
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
