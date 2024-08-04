import { auth } from "@/auth";
import { COLLECTION_ALL_RECIPES } from "@/recipes/getRecipes";
import {
  removeRecipePermanently,
  removeWeeklyRecipe,
} from "@/recipes/removeRecipe";
import { COLLECTION_WEEKLY_RECIPES } from "@/recipes/rollRecipes";

export async function POST(request: Request) {
  const body = await request.json();
  const type = body.type;
  const _id = body._id;

  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }

  try {
    if (type === "weekly") {
      const result = await removeWeeklyRecipe(_id, session.user.id);
      return Response.json(result);
    }

    const result = await removeRecipePermanently(_id, session.user.id);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
