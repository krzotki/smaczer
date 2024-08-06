import { auth, getUser } from "@/auth";
import { rollOneRecipe } from "@/recipes/rollRecipes";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const owner = body.owner;
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" });
    }

    if (owner && session?.user?.id !== owner) {
      const user = await getUser(owner);

      if (
        !session?.user?.email ||
        !user?.sharedWith?.includes(session.user.email)
      ) {
        return Response.json({ error: "Unauthorized" });
      }
    }

    const result = await rollOneRecipe(owner);

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
