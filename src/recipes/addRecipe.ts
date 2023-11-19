import { InsertOneResult, MongoClient, ObjectId } from "mongodb";
import { RecipeType } from "./types";
import { dbName, dbUrl } from "./config";
import axios from "axios";
import cheerio from "cheerio";

export const addRecipeFromUrl = (url: string) => {
  return new Promise<InsertOneResult>(async (resolve, reject) => {
    const regex = /https?:\/\/smaker\.pl\/[^\s]+/;
    const match = url.match(regex);

    if (!match) {
      reject(
        "The provided URL is not valid. Please include smaker.pl in the URL."
      );
      return;
    }

    let recipe: RecipeType;
    try {
      recipe = await getRecipeFromUrl(url);
    } catch (e) {
      reject(e);
      return;
    }

    MongoClient.connect(dbUrl)
      .then((client) => {
        const db = client.db(dbName);

        // Read Data from a Collection
        db.collection("recipes")
          .insertOne({
            ...recipe,
            _id: new ObjectId(recipe.id),
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

const getRecipeFromUrl = (url: string) => {
  return new Promise<RecipeType>(async (resolve, reject) => {
    try {
      const response = await axios.get(url);

      const html = response.data;

      // Load the HTML content into cheerio
      const $ = cheerio.load(html);
      // Find all script tags
      $("script").each((i, elem) => {
        const scriptContent = $(elem).html();
        if (!scriptContent) {
          return;
        }

        // Use regular expression to find the specific script
        const scriptRegex = /var scripts = (\{.*?\});/s;
        const matches = scriptContent.match(scriptRegex);

        if (matches) {
          // Parse the captured JSON string
          try {
            const scriptsObj = JSON.parse(matches[1]);

            // Extract only the 'recipe' property
            if (scriptsObj && scriptsObj.recipe) {
              resolve(scriptsObj.recipe);
            }
          } catch (parseError) {
            return;
          }
        }
      });
    } catch (error) {
      reject(error);
      return;
    }
  });
};
