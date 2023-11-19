import { InsertOneResult, MongoClient, ObjectId } from "mongodb";
import { RecipeType } from "./types";
import { dbName, dbUrl } from "./config";
import axios from "axios";
import cheerio from "cheerio";
import weaviate from "weaviate-ts-client";
import { WeaviateStore } from "langchain/vectorstores/weaviate";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const setupWeaviate = async () => {
  const weaviateClient = (weaviate as any).client({
    scheme: process.env.WEAVIATE_SCHEME || "https",
    host: process.env.WEAVIATE_HOST || "localhost",
    apiKey: new (weaviate as any).ApiKey(
      process.env.WEAVIATE_API_KEY || "default"
    ),
  });
  console.log({ weaviateClient });
  try {
    const store = await WeaviateStore.fromTexts(
      ["hello world", "hi there", "how are you", "bye now"],
      [{ foo: "bar" }, { foo: "baz" }, { foo: "qux" }, { foo: "bar" }],
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPEN_AI_API_KEY,
      }),
      {
        client: weaviateClient,
        indexName: "Smaczer",
        textKey: "text",
        metadataKeys: ["foo"],
      }
    );
    console.log({ store });
  } catch (e) {
    console.log({ e });
  }
};

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
