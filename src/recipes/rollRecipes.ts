import { MongoClient, ObjectId, OptionalId, WithId } from "mongodb";
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

export const rollWeeklyRecipes = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        const db = client.db(dbName);

        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((c) => c.name);
        const collectionName = COLLECTION_WEEKLY_RECIPES;
        if (!collectionNames.includes(collectionName)) {
          await db.createCollection(collectionName);
          console.log(`Collection ${collectionName} created`);
        } else {
          console.log(
            `Collection ${collectionName} already exists. Clearing (droping and recreating) collection`
          );
          await db.dropCollection(collectionName);
          await db.createCollection(collectionName);
        }

        const recipes = await new Promise<Array<RecipeType>>(
          (resolve, reject) => {
            db.collection(COLLECTION_ALL_RECIPES)
              .find({})
              .toArray()
              .then((items) => {
                resolve(
                  items.map(({ _id, ...rest }) => ({
                    ...(rest as RecipeType),
                    _id: _id.toString(),
                  }))
                );
              })
              .catch((error) => {
                reject(error);
              });
          }
        );

        const randomRecipes = rng.pickRandomElements(recipes, 10);

        randomRecipes.forEach(async (recipe) => {
          if (!recipe.ingredientsCost) {
            getIngredientsPrice(ingredientsToString(recipe)).then(
              async (cost) => {
                await updateRecipe(COLLECTION_ALL_RECIPES, {
                  ...recipe,
                  ingredientsCost: cost,
                });
                await updateRecipe(COLLECTION_WEEKLY_RECIPES, {
                  ...recipe,
                  ingredientsCost: cost,
                });
              }
            );
          }
        });

        db.collection(collectionName)
          .insertMany(
            randomRecipes.map((recipe) => ({
              ...recipe,
              _id: new ObjectId(recipe._id),
            }))
          )
          .then((result) => {
            resolve(result);
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
