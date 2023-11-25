import { indexRecipes } from "@/recipes/getRecipes";

export async function GET(request: Request) {
  try {
    const result = await indexRecipes();

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
