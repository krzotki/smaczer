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
      .then((client) => {
        console.log("Connected");
        const db = client.db(dbName);
        console.log("Connected to db");
        client.close();
        return;
        // const collections = await db.listCollections().toArray();
        // const collectionNames = collections.map((c) => c.name);
        // const collectionName = COLLECTION_WEEKLY_RECIPES;
        // if (!collectionNames.includes(collectionName)) {
        //   await db.createCollection(collectionName);
        //   console.log(`Collection ${collectionName} created`);
        // } else {
        //   console.log(
        //     `Collection ${collectionName} already exists. Clearing (droping and recreating) collection`
        //   );
        //   await db.dropCollection(collectionName);
        //   await db.createCollection(collectionName);
        // }

        // const recipes = await new Promise<Array<RecipeType>>(
        //   (resolve, reject) => {
        //     db.collection(COLLECTION_ALL_RECIPES)
        //       .find({})
        //       .toArray()
        //       .then((items) => {
        //         resolve(
        //           items.map(({ _id, ...rest }) => ({
        //             ...(rest as RecipeType),
        //             _id: _id.toString(),
        //           }))
        //         );
        //       })
        //       .catch((error) => {
        //         reject(error);
        //       });
        //   }
        // );

        // const randomRecipes = rng.pickRandomElements(recipes, 10);
        // const withCost = await Promise.all(
        //   randomRecipes.map(async (recipe) => {
        //     console.log({ recipe });
        //     if (recipe.ingredientsCost) {
        //       return recipe;
        //     }

        //     const cost = await getIngredientsPrice(ingredientsToString(recipe));

        //     const updateRes = await db
        //       .collection(COLLECTION_ALL_RECIPES)
        //       .updateOne(
        //         {
        //           _id: new ObjectId(recipe._id),
        //         },
        //         {
        //           $set: {
        //             ingredientsCost: cost,
        //           },
        //         }
        //       );

        //     console.log({ updateRes });

        //     return {
        //       ...recipe,
        //       ingredientsCost: cost,
        //     };
        //   })
        // );

        // db.collection(collectionName)
        //   .insertMany(
        //     withCost.map((recipe) => ({
        //       ...recipe,
        //       _id: new ObjectId(recipe._id),
        //     }))
        //   )
        //   .then((result) => {
        //     resolve(result);
        //     client.close();
        //   })
        //   .catch((error) => {
        //     reject(error);
        //     client.close();
        //   });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
