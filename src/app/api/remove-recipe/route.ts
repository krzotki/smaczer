import { COLLECTION_ALL_RECIPES } from "@/recipes/getRecipes";
import { removeRecipe } from "@/recipes/removeRecipe";
import {
  COLLECTION_WEEKLY_RECIPES,
} from "@/recipes/rollRecipes";

export async function POST(request: Request) {
  const body = await request.json();
  const type = body.type;
  const _id = body._id;

  const collection =
    type === "weekly" ? COLLECTION_WEEKLY_RECIPES : COLLECTION_ALL_RECIPES;

  try {
    const result = await removeRecipe(collection, _id);

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
