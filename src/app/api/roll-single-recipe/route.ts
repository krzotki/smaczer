import { auth } from "@/auth";
import { rollOneRecipe, rollWeeklyRecipes } from "@/recipes/rollRecipes";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" });
    }
    const result = await rollOneRecipe(session.user.id);

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
