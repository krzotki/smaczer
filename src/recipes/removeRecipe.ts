import { MongoClient, ObjectId } from "mongodb";
import { RecipeType } from "./types";
import { dbName, dbUrl } from "./config";
import { COLLECTION_WEEKLY_RECIPES } from "./rollRecipes";
import { COLLECTION_ALL_RECIPES } from "./getRecipes";

export const removeRecipePermanently = (_id: string, userId: string) => {
  return new Promise(async (resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then((client) => {
        const db = client.db(dbName);
        // Read Data from a Collection
        db.collection(COLLECTION_ALL_RECIPES)
          .deleteOne({
            _id: new ObjectId(_id),
            "user.id": userId,
          })
          .then((result) => {
            resolve(result);
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

export const removeWeeklyRecipe = (_id: string, userId: string) => {
  return new Promise(async (resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then((client) => {
        const db = client.db(dbName);
        // Read Data from a Collection
        db.collection(COLLECTION_WEEKLY_RECIPES)
          .deleteOne({
            _id: new ObjectId(_id),
            owner: userId,
          })
          .then((result) => {
            resolve(result);
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
