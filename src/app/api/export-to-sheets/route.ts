import { getIngredientsPrice } from "@/recipes/addRecipe";
import { getAllRecipes } from "@/recipes/getRecipes";
import { COLLECTION_WEEKLY_RECIPES } from "@/recipes/rollRecipes";
import {
  SchemaType,
  createShoppingList,
  getSavedShoppingList,
  saveShoppingList,
} from "@/recipes/shoppingList";
import { google } from "googleapis";

const sheets = google.sheets("v4");
const auth = new google.auth.GoogleAuth({
  keyFile: "./smaczer-c060515aa8c6.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

google.options({ auth });
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const update = searchParams.get("update");

  try {
    let list: SchemaType;

    const weekly = await getAllRecipes(COLLECTION_WEEKLY_RECIPES);

    const saved = await getSavedShoppingList();

    if (saved[0] && !update) {
      list = saved[0].parsed;
    } else {
      const result = await createShoppingList();
      saveShoppingList(result);
      list = result.parsed;
    }

    const spreadsheetId = "1-JiwaI8l943B6Wbqh4yCVRLPMqh2wwOc38hr2t1EG-I";
    const range = "Sheet1!A2";
    const valueInputOption = "USER_ENTERED";
    let sheetData: any = [];
    let rowsCount = 0;

    // Add a row for each category and its items
    Object.values(list).forEach((arr: any) => {
      if (arr?.length > rowsCount) {
        rowsCount = arr.length;
      }
    });

    for (let i = 0; i < rowsCount; i++) {
      let row: string[] = [];
      if (weekly[i]) {
        row.push(
          `=HYPERLINK("${process.env.APP_URL}/recipe/${weekly[i]._id}", "${weekly[i].name}")`
        );
      } else {
        row.push("");
      }
      Object.values(list).forEach((arr: any) => {
        row.push(arr[i] || "");
      });

      sheetData.push(row); // Add an empty row for spacing between categories
    }

    const request = {
      spreadsheetId,
      range,
      valueInputOption,
      resource: {
        values: sheetData,
      },
    };

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: "Sheet1!A2:H37",
    });

    await sheets.spreadsheets.values.update(
      request,
      (err: any, response: any) => {
        console.log({ response });
        if (err) {
          console.error(err);
          return;
        }
        // TODO: Do something with the response
      }
    );

    return Response.json(list);
  } catch (e) {
    return Response.json({ error: e });
  }
}
