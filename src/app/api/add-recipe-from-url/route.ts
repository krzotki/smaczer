import { addRecipeFromUrl } from "@/recipes/addRecipe";

export async function POST(request: Request) {
  const body = await request.json();
  const url = body.url;

  try {
    const result = await addRecipeFromUrl(url);

    return Response.json(result);
  } catch (e) {
    return Response.json({error: e});
  }
}
