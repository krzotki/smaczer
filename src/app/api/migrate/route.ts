import { getIngredientsPrice } from "@/recipes/addRecipe";
import { migrate } from "@/utils/migrate";

export async function GET(request: Request) {
  try {
    const res = await migrate();
    return Response.json({ res });
  } catch (e) {
    return Response.json({ error: e });
  }
}
