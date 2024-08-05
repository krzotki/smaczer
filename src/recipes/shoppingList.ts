import { MongoClient } from "mongodb";
import { ingredientsToString } from "./addRecipe";
import { dbName, dbUrl, openAIClient } from "./config";
import { getAllRecipes } from "./getRecipes";
import { COLLECTION_WEEKLY_RECIPES } from "./rollRecipes";
import { RecipeType } from "./types";
import type { FromSchema } from "json-schema-to-ts";

export const COLLECTION_SHOPPING_LIST = "shopping_list";

const itemSchema = {
  type: "string",
  description: "Nazwa oraz ilość składnika",
} as const;

const schema = {
  type: "object",
  properties: {
    mieso: {
      type: "array",
      items: itemSchema,
      description:
        "Lista składników mięsnych, takich jak kurczak, wołowina, wieprzowina, ryba, itd.",
    },
    warzywa: {
      type: "array",
      items: itemSchema,
      description:
        "Lista składników warzywnych, owoców oraz świerzych ziół, takich jak ziemniaki, cebula, pomidory, czosnek, cytryna, jabłka, pietruszka, itd.",
    },
    nabial: {
      type: "array",
      items: itemSchema,
      description:
        "Lista składników pochodzenia zwierzęcego, takich jak mleko, sery, jogurty, masło, jajka, itd",
    },
    suche: {
      type: "array",
      items: itemSchema,
      description:
        "Lista suchych składników, takich jak przyprawy, mąki, ryż, płatki, itd",
    },
    napoje: {
      type: "array",
      items: itemSchema,
      description: "Lista składników płynnych, takich jak piwo, wino",
    },
    konserwy: {
      type: "array",
      items: itemSchema,
      description:
        "Lista składników konserwowych takich jak fasola, kukurydza, pomidory w puszce, musztarda, majonez, itd.",
    },
    pozostale: {
      type: "array",
      items: itemSchema,
      description:
        "Lista pozostałuch składników, które nie pasują do pozostałych kategorii",
    },
  },
} as const;

export type SchemaType = FromSchema<typeof schema>;

async function classifyProducts(ingredients: string) {
  const prompt = `Zwróć listę wszystkich podanych produktów, przypisując je do odpowiednich kategorii, zachowując maksymalną długość znaków (30): ${ingredients}`;

  const completion = await openAIClient.chat.completions.create({
    // model: "gpt-3.5-turbo-1106",
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Jesteś pomocnikiem przy tworzeniu listy zakupów.",
      },
      { role: "user", content: prompt },
    ],
    functions: [{ name: "set_recipe", parameters: schema }],
    function_call: { name: "set_recipe" },
    temperature: 0,
  });

  const args = completion.choices[0].message.function_call?.arguments || "{}";

  return args;
}

async function sumProducts(currentIngredients: string, newIngredients: string) {
  const prompt = `Zsumuj ilości podanych składników. 
  Przykłady:
  - kurczak 300g + pierś z kurczaka 500g + 1 większy filet z kurczaka = 1100g kurczka (zakładając że 1 większy filet/pierś z kurczaka to 300g)
  - 1 jajko + 3 jajka + 1 większe jajko = 5 jajka
  - 2 papryki + 1 czerwona papryka = 3 papryki
  Jeśli składniki zawierają różne jednostki, przyjmij ilość "na oko". Na przykład plaster sera - 20g, łyżka mąki - 10g.
  NIE PROŚ o dokładniejsze jednostki!
  Jeśli jednostka nie została podana, załóż że chodzi i jedną sztukę tego składnika. Na przykład Sałata to 1 główka Sałaty.
  Nie uogólniaj składników na siłę (np. kapusta pekińska a biała kapusta to różne produkty).
  Zwróć wynik w postaci listy (pomiń składniki takie jak sól, pieprz, woda, cukier jeśli ich ilości są wystarczająco małe (szczypta albo łyżka)).
  Wyjściowa ilość elementów (składników) nie powinna być krótsza niż ilość elementów wejściowych.
  Zwróc tylko i wyłącznie już zsumowane składniki.

  Obecne składniki:
   ${currentIngredients}
   
  Dodaj te składniki do obecnych:
  ${newIngredients} 
   `;
  const completion = await openAIClient.chat.completions.create({
    // model: "gpt-3.5-turbo-1106",
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Jesteś pomocnikiem przy tworzeniu listy zakupów.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0,
  });

  const summed = completion.choices[0].message.content;

  return summed || "";
}

const testSummed =
  'Oto zsumowana lista zakupów. Podane ilości są wynikiem dodania wymienionych składników:\n\n- Główka młodej kapusty: 1/4 + 1/2 = 3/4 główki\n- Cukinia: 250g\n- Kaszanka/kiełbasa: 250g\n- Papryki (kolorowe, żółta i czerwona): 2 sztuki + 1 zielona = 3 sztuki\n- Cebula: 1 duża + 1 sztuka + 2 sztuki + 1/2 główki pekińskiej (traktuję jako minimum 1 dodatkową cebulę, bo główka pekińska może się różnić wielkością od cebuli)\n- Czosnek: 2 ząbki + 2 ząbki + 2 ząbki = 6 ząbków\n- Olej: 3 łyżki + 1 łyżka + 1 łyżka + 4-5 łyżek + do woka (użyję 2 łyżki, by być konserwatywnym) + olej do smażenia (dodatkowe 2 łyżki) = 12-13 łyżek + do smażenia\n- Masło/smalec: 1 łyżka masła / 3 łyżki smalcu (w zależności od wyboru) + masło klarowane do smażenia (użyję 2 łyżki) + 1 łyżka masła = 4 łyżki masła/smalcu + masło klarowane do smażenia\n- Pieczarki: 300g\n- Koncentrat pomidorowy: 2 łyżki\n- Twaróg: 250g\n- Mąka pszenna: 200g + 3 łyżki + 5 łyżek = około 290g (5 łyżek to około 40g, 1 łyżka to około 8g)\n- Ziemniaki: 200g + 500g = 700g\n- Jajka: 1 + 3-4 (użyję 3,5 jako średnią) + 2 + 1 + 2 + 1 = 10,5 jajek (użyję 11 jaj, zaokrąglając w górę)\n- Łosoś: 6 kawałków po około 150g (łącznie 900g)\n- Kurczak: 300g + 500g + 1 większy filet (300g) + 2 piersi (załóżmy, że 400g) + filet (załóżmy 200g) = 1700g kurczka\n- Ser żółty: 50g + plaster (załóżmy 30g) = 80g\n- Ryż: 100g\n- Przecier pomidorowy: 0,5 litra\n- Zioła/Przyprawy: Selera, Seler, pietruszka, bazylia, lubczyk, papryka, natka pietruszki, rozmaryn, czosnek granulowany, czosnek niedźwiedzi, przyprawa do kurczaka, sól, pieprz, pieprz ziołowy, pieprz kolorowy, czerwona papryka, pieprz czarny\n- Makaron udon: 200g\n- Grzyby mun: 6 sztuk\n- Sosy: Sojowy, ostrygowy (po 2 łyżki)\n- Cukier palmowy: 1/2 łyżeczki + 1/2 łyżeczki = 1 łyżeczka\n- Szpinak: 200g\n- Kremówka/śmietana 18%: 100 ml\n- Serek topiony kremowy: 1 kostka\n- Cytryna: 1/2 sztuki\n- Bułka tarta do panierowania: ilość według potrzeb\n- Semolina: ilość według potrzeb\n- Panko: ilość według potrzeb\n\nProszę zwrócić uwagę, że niektóre przyprawy i olej "do smażenia" zostały podane jako ilość "do smaku" lub "do smażenia", więc nie zostały ilościowo określone w sumie. W takich przypadkach zachęcam do kupna według własnego uznania, uwzględniając przewidywane potrzeby w przepisach.';

export const createShoppingList = async (userId: string) => {
  const recipes = await getAllRecipes(COLLECTION_WEEKLY_RECIPES, userId);

  const ingredients = recipes.map(ingredientsToString);

  let summed = ingredients[0];

  for (let i = 1; i < ingredients.length; i++) {
    console.log({ summed, recipe: recipes[i].name });
    summed = await sumProducts(summed, ingredients[i]);
  }

  console.log("FINAL SUMMED", { summed });

  const classified = await classifyProducts(summed);
  const parsed = JSON.parse(classified) as SchemaType;
  return { classified, summed, parsed };
};

export const saveShoppingList = async (
  shoppingList: SchemaType,
  userId: string
) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          const collections = await db.listCollections().toArray();
          const collectionNames = collections.map((c) => c.name);
          if (!collectionNames.includes(COLLECTION_SHOPPING_LIST)) {
            await db.createCollection(COLLECTION_SHOPPING_LIST);
            console.log(`Collection ${COLLECTION_SHOPPING_LIST} created`);
          }

          const result = await db.collection(COLLECTION_SHOPPING_LIST).insertOne({
            ...shoppingList,
            owner: userId,
            date: Date.now(),
          });

          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          client.close(); // Close the connection after the operation is complete
        }
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

export const getSavedShoppingList = async (userId: string) => {
  return new Promise<Array<{ parsed: SchemaType }>>((resolve, reject) => {
    MongoClient.connect(dbUrl)
      .then(async (client) => {
        try {
          const db = client.db(dbName);

          const result = await db.collection(COLLECTION_SHOPPING_LIST)
            .find({ owner: userId })
            .sort({ date: -1 })
            .toArray();

          resolve(result as any);
        } catch (error) {
          reject(error);
        } finally {
          client.close(); // Close the connection after the operation is complete
        }
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};
