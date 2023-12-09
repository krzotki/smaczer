import { rollOneRecipe, rollWeeklyRecipes } from "@/recipes/rollRecipes";

export async function POST(request: Request) {
  try {
    const result = await rollOneRecipe();

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
