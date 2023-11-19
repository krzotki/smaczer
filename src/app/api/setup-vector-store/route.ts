import { addRecipeFromUrl, setupWeaviate } from "@/recipes/addRecipe";

export async function GET(request: Request) {
  try {
    const result = await setupWeaviate();

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
