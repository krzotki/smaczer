import { auth } from "@/auth";
import { addRecipeFromUrl } from "@/recipes/addRecipe";
import { getRecipesBySimilarity } from "@/recipes/getRecipes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ingredients = searchParams.get("ingredients");
  const count = searchParams.get("count");
  const session = await auth();

  if(!session) {
    return Response.json({ error: "Unauthorized" });
  }

  try {
    const result = await getRecipesBySimilarity(
      String(ingredients),
      Number(count),
      session
    );

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
