import { MongoClient, ObjectId } from "mongodb";
import { dbName, dbUrl } from "./config";
import { COLLECTION_WEEKLY_RECIPES } from "./rollRecipes";
import { COLLECTION_ALL_RECIPES } from "./getRecipes";

export const removeRecipePermanently = (_id: string, userId: string) => {
  return new Promise(async (resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);
          // Read Data from a Collection
          const result = await db.collection(COLLECTION_ALL_RECIPES).deleteOne({
            _id: new ObjectId(_id),
            "user.id": userId,
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

export const removeWeeklyRecipe = (_id: string, userId: string) => {
  return new Promise(async (resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);
          // Read Data from a Collection
          const result = await db.collection(COLLECTION_WEEKLY_RECIPES).deleteOne({
            _id: new ObjectId(_id),
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
