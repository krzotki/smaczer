import { addRecipeToWeekly } from "@/recipes/addRecipe";

export async function POST(request: Request) {
  const body = await request.json();
  const _id = body._id;

  try {
    const result = await addRecipeToWeekly(_id);

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
