import { MongoClient, ObjectId } from "mongodb";
import { Recipe } from "./types";

const url: string = `mongodb://root:example@mongo:27017/?authSource=admin`;
const dbName: string = "recipes";

const MAX_PAGE_SIZE = 20;

export type RecipeListItem = Pick<Recipe, "_id" | "id" | "name" | "photoPath">;

export const getRecipes = (page: number) => {
  return new Promise<RecipeListItem[]>((resolve, reject) => {
    MongoClient.connect(url)
      .then((client) => {
        const db = client.db(dbName);

        // Read Data from a Collection
        db.collection("recipes")
          .find({})
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
  return new Promise<Recipe>((resolve, reject) => {
    MongoClient.connect(url)
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
                ...(rest as Recipe),
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
