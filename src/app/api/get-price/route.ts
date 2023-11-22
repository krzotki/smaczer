import { getIngredientsPrice } from "@/recipes/addRecipe";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ingredients = body.ingredients;
    const result = await getIngredientsPrice(ingredients);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
