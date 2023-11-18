import { MongoClient, ObjectId } from "mongodb";
import { RecipeType } from "./types";
import { dbName, dbUrl } from "./config";

const MAX_PAGE_SIZE = 21;

export type RecipeListItem = Pick<
  RecipeType,
  "_id" | "id" | "name" | "photoPath"
>;

export const getRecipes = (page: number) => {
  return new Promise<RecipeListItem[]>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then((client) => {
        const db = client.db(dbName);

        // Read Data from a Collection
        db.collection("recipes")
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
        db.collection("recipes")
          .findOne({
            _id: new ObjectId(id),
          })
          .then((item) => {
            if (item) {
              const { _id, ...rest } = item;
              console.log({ rest, item });
              resolve({
                ...(rest as RecipeType),
                _id: _id.toString(),
              });
            } else {
              reject("Recipe not found");
            }
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
