import { InsertOneResult, MongoClient, ObjectId } from "mongodb";
import { RecipeType, User } from "./types";
import { dbName, dbUrl, openAIClient, pineconeStore } from "./config";
import axios from "axios";
import cheerio from "cheerio";
import {
  COLLECTION_ALL_RECIPES,
  createDocumentsFromRecipes,
  getRecipe,
} from "./getRecipes";
import OpenAI from "openai";
import { COLLECTION_WEEKLY_RECIPES } from "./rollRecipes";

const exampleIngredients = `
1/4 główki młodej kapusty
1 mała cukinia – 250g
250 g kaszanki meksykańskiej paprykowej Sokołów (można zamiast kaszanki dodać kiełbasę zwyczajną czy śląską)
2 papryki – kolorowe (żółta i czerwona)
1 duża cebula
2 ząbki czosnku
3 łyżki oleju1 łyżka masła lub 3 łyżki smalcu ( bez dodawania oleju)
300 g pieczarek
2 łyżki koncentratu pomidorowego
sól, pieprz i czerwona papryka do smaku
garść ulubionych ziół ( koperek, lubczyk, oregano świeże)
`;

const exampleCostCalculation = `
Aby obliczyć całkowity koszt składników w polskich złotych, weźmiemy pod uwagę średnie ceny każdego z nich:
- 1/4 główki młodej kapusty: Cała młoda kapusta kosztuje około 3 PLN, więc ćwierć będzie kosztowała około 0,75 PLN.
- 1 mała cukinia - 250g: Cukinia kosztuje około 6 PLN za kg, więc za 250g będzie to około 1,5 PLN.
- 250 g kaszanki meksykańskiej paprykowej Sokołów: Ta specjalna kiełbasa może kosztować około 20 PLN za kg, więc 250g będzie kosztować około 5 PLN. Jeśli zastąpi się ją zwykłą kiełbasą, cena może być nieco niższa, ale użyjemy tej wyższej wyceny.
- 2 papryki - kolorowe: Papryka kosztuje około 8 PLN za kg, więc dwie średniej wielkości papryki ważące łącznie około 500g będą kosztować około 4 PLN.
- 1 duża cebula: Koszt jednej dużej cebuli to około 0,80 PLN.
- 2 ząbki czosnku: Główka czosnku kosztuje około 1,50 PLN, a mając około 10 ząbków w główce, dwa ząbki będą kosztować około 0,30 PLN.
- 3 łyżki oleju: Olej roślinny kosztuje około 6 PLN za litr; trzy łyżki to około 30 ml, co będzie kosztować około 0,18 PLN.
- 1 łyżka masła lub 3 łyżki smalcu: Masło kosztuje około 6 PLN za 200g, więc jedna łyżka (około 15g) będzie kosztować 0,45 PLN. Smalec jest tańszy, ale do obliczeń użyjemy ceny masła.
- 300 g pieczarek: Pieczarki kosztują około 10 PLN za kg, więc 300g będzie kosztować około 3 PLN.
- 2 łyżki koncentratu pomidorowego: Mała puszka koncentratu pomidorowego (70g) kosztuje około 1,50 PLN, co powinno wystarczyć na dwie łyżki.
- Sól, pieprz i czerwona papryka, garść ulubionych ziół: Są zwykle dość tanie i używane w małych ilościach, więc możemy je oszacować łącznie na około 2 PLN.

Sumując wszystkie szacowane koszty:
0,75 + 1,5 + 5 + 4 + 0,80 + 0,30 + 0,18 + 0,45 + 3 + 1,50 + 2 = 19,48 PLN

Całkowity koszt wymienionych składników, w oparciu o średnie ceny w Polsce, wyniesie około 19,48 PLN.

TOTAL_COST=19.48
`;

export const ingredientsToString = (recipe: RecipeType) =>
  recipe.ingredients
    .map(({ items }) => items.map((item) => item.name).join("\n"))
    .join("\n");

export const getIngredientsPrice = async (ingredients: string) => {
  console.log("CALCULATING INGREDIENTS PRICE");
  const response = await openAIClient.chat.completions.create({
    // model: "gpt-4-vision-preview",
    // model: "gpt-4",
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `Calculate the total cost in Polish złoty for the following ingredients, considering average prices in Poland, and return the total price as a single number in the TOTAL_COST field. Show only calculations without much of description.
          Example:
          ${exampleIngredients}

          Response:
          ${exampleCostCalculation}
          `,
      },
      {
        role: "user",
        content: ingredients,
      },
    ],
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
  });
  console.log("FINISHED CALCULATING INGREDIENTS PRICE");
  return response.choices[0].message.content;
};

export const addRecipeFromUrl = (url: string, user: User) => {
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

    const _id = new ObjectId(recipe.id);
    const fullRecipe = {
      ...recipe,
      _id: _id.toString(),
    };

    const indexRes = await pineconeStore.addDocuments(
      createDocumentsFromRecipes([fullRecipe])
    );

    console.log({ indexRes });

    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          // Read Data from a Collection
          const result = await db
            .collection(COLLECTION_ALL_RECIPES)
            .insertOne({ ...fullRecipe, _id, user });
          client.close(); // Close the connection after the operation is complete

          const ingredientsCost = await getIngredientsPrice(
            ingredientsToString(recipe)
          );
          console.log({ ingredientsCost });

          const updateRes = await updateRecipe(COLLECTION_ALL_RECIPES, {
            ...fullRecipe,
            user,
            ingredientsCost,
          });
          console.log({ updateRes });

          resolve(result);
        } catch (error) {
          reject(error);
          client.close(); // Also close the connection in case of an error
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const recalculateCost = (_id: string, userId: string) => {
  return new Promise<{ success: boolean }>(async (resolve, reject) => {
    const recipe = await getRecipe(_id);
    if (recipe.user.id !== userId) {
      reject("Unauthorized");
      return;
    }

    try {
      const ingredientsCost = await getIngredientsPrice(
        ingredientsToString(recipe)
      );

      await updateRecipe(COLLECTION_ALL_RECIPES, {
        _id,
        ingredientsCost,
      });
      await updateRecipe(COLLECTION_WEEKLY_RECIPES, {
        _id,
        ingredientsCost,
      });
      resolve({
        success: true,
      });
    } catch (e) {
      resolve({
        success: false,
      });
    }
  });
};

export const addRecipeToWeekly = (_id: string, userId: string) => {
  return new Promise<InsertOneResult>(async (resolve, reject) => {
    const recipe = await getRecipe(_id);

    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          const result = await db
            .collection(COLLECTION_WEEKLY_RECIPES)
            .insertOne({
              ...recipe,
              _id: new ObjectId(),
              owner: userId,
              originalId: _id,
            });
          client.close();

          if (!recipe.ingredientsCost) {
            const ingredientsCost = await getIngredientsPrice(
              ingredientsToString(recipe)
            );
            await updateRecipe(COLLECTION_ALL_RECIPES, {
              _id,
              ingredientsCost,
            });
            await updateRecipe(COLLECTION_WEEKLY_RECIPES, {
              _id,
              ingredientsCost,
            });
          }

          resolve(result);
        } catch (error) {
          reject(error);
          client.close();
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const updateRecipe = (
  collection: string,
  recipe: Partial<RecipeType>
) => {
  return new Promise(async (resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);
          const { _id, ...rest } = recipe;
          // Read Data from a Collection
          const result = await db.collection(collection).updateOne(
            {
              _id: new ObjectId(recipe._id),
            },
            {
              $set: {
                ...rest,
              },
            }
          );

          resolve(result);
          client.close(); // Close the connection after the operation is complete
        } catch (error) {
          reject(error);
          client.close(); // Also close the connection in case of an error
        }
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
