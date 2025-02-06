import { auth } from "@/auth";
import { addRecipeFromForm, editRecipe } from "@/recipes/addRecipe";
import { getRecipe } from "@/recipes/getRecipes";

export async function PATCH(request: Request) {
  const body = await request.json();
  const recipe = body.recipe;
  const session = await auth();
  const originalRecipe = await getRecipe(recipe.id);

  if (!session?.user?.id || recipe.user.id !== session.user.id) {
    return Response.json({ error: "Unauthorized" });
  }

  try {
    const result = await editRecipe(recipe, {
      id: session.user.id,
      name: session.user.name || "Anonim",
      photoPath: session.user.image || "",
      email: session.user.email || "",
    });

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
