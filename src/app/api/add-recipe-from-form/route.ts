import { auth } from "@/auth";
import { addRecipeFromForm } from "@/recipes/addRecipe";

export async function POST(request: Request) {
  const body = await request.json();
  const recipe = body.recipe;
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }
  try {
    const result = await addRecipeFromForm(recipe, {
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
