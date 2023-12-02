import { MongoClient, ObjectId } from "mongodb";
import { RecipeType } from "./types";
import { dbName, dbUrl } from "./config";

export const removeRecipe = (collection: string, _id: string) => {
  console.log({collection, _id})
  return new Promise(async (resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then((client) => {
        const db = client.db(dbName);
        // Read Data from a Collection
        db.collection(collection)
          .deleteOne({
            _id: new ObjectId(_id),
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
