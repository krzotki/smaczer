import { auth } from "@/auth";
import { getIngredientsPrice } from "@/recipes/addRecipe";
import {
  createShoppingList,
  getSavedShoppingList,
  saveShoppingList,
} from "@/recipes/shoppingList";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const update = searchParams.get("update");

  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }

  try {
    const saved = await getSavedShoppingList(session.user.id);

    if (saved[0] && !update) {
      return Response.json(saved[0]);
    }

    const result = await createShoppingList(session.user.id);
    saveShoppingList(result, session.user.id);

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
