import { rollWeeklyRecipes } from "@/recipes/rollRecipes";

export async function POST(request: Request) {
  try {
    const result = await rollWeeklyRecipes();

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
