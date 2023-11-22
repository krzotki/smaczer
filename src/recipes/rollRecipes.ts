import { MongoClient, OptionalId, WithId } from "mongodb";
import { dbName, dbUrl } from "./config";
import { RandomLCG } from "@/utils/random";
import { COLLECTION_ALL_RECIPES } from "./getRecipes";

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

        const recipes = await new Promise<WithId<Document>[]>(
          (resolve, reject) => {
            db.collection(COLLECTION_ALL_RECIPES)
              .find({})
              .toArray()
              .then((items) => {
                resolve(items as WithId<Document>[]);
              })
              .catch((error) => {
                reject(error);
              });
          }
        );

        const randomRecipes = rng.pickRandomElements(recipes, 10);

        db.collection(collectionName)
          .insertMany(randomRecipes as OptionalId<Document>[])
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
