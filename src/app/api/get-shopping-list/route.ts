import { getIngredientsPrice } from "@/recipes/addRecipe";
import {
  createShoppingList,
  getSavedShoppingList,
  saveShoppingList,
} from "@/recipes/shoppingList";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const update = searchParams.get("update");

  try {
    const saved = await getSavedShoppingList();

    if (saved[0] && !update) {
      return Response.json(saved[0].parsed);
    }

    const result = await createShoppingList();
    saveShoppingList(result);

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
