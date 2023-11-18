import { addRecipeFromUrl } from "@/recipes/addRecipe";

export async function POST(request: Request) {
  const body = await request.json();
  const url = body.url;
    
  const result = await addRecipeFromUrl(url);

  return Response.json(result);
}
