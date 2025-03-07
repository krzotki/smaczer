import { auth, getUser } from "@/auth";
import { getIngredientsPrice } from "@/recipes/addRecipe";
import {
  COLLECTION_ALL_RECIPES,
  filterTruthy,
  getAllRecipes,
  getMappedWeeklyRecipes,
  getRecipe,
} from "@/recipes/getRecipes";
import { COLLECTION_WEEKLY_RECIPES } from "@/recipes/rollRecipes";
import {
  SchemaType,
  createShoppingList,
  getSavedShoppingList,
  saveShoppingList,
} from "@/recipes/shoppingList";
import { google } from "googleapis";

const sheets = google.sheets("v4");

google.options({
  auth: new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: "smaczer",
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      client_email: "smaczer@smaczer.iam.gserviceaccount.com",
      client_id: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
      universe_domain: "googleapis.com",
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});
/**
 * @deprecated
 * We will create a dedicated page for shopping list
 */
export async function POST(request: Request) {
  const body = await request.json();
  const owner = body.owner;
  const shoppingList = body.shoppingList;
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }

  if (owner && session?.user?.id !== owner) {
    const user = await getUser(owner);

    if (
      !session?.user?.email ||
      !user?.sharedWith?.includes(session.user.email)
    ) {
      return Response.json({ error: "Unauthorized" });
    }
  }

  try {
    let list: SchemaType;

    const weekly = await getMappedWeeklyRecipes(owner);

    const result = shoppingList;

    await saveShoppingList(result, owner);
    list = result;

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

    if (weekly.length > rowsCount) {
      rowsCount = weekly.length;
    }

    for (let i = 0; i < rowsCount; i++) {
      let row: string[] = [];
      if (weekly[i]) {
        row.push(
          `=HYPERLINK("${process.env.APP_URL}/recipe/${weekly[i].originalId}", "${weekly[i].name}")`
        );
      } else {
        row.push("");
      }
      Object.values(list).forEach((arr: any) => {
        row.push(arr[i] || "");
      });

      sheetData.push(row);
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
        if (err) {
          console.error(err);
          return;
        }
        // TODO: Do something with the response
      }
    );

    return Response.json(list);
  } catch (e) {
    console.error(e);
    return Response.json({ error: e });
  }
}
