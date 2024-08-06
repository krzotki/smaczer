import { auth, getUser } from "@/auth";
import { addRecipeToWeekly } from "@/recipes/addRecipe";

export async function POST(request: Request) {
  const body = await request.json();
  const _id = body._id;
  const owner = body.owner;
  const session = await auth();

  if (owner) {
    const user = await getUser(owner);

    if (!session?.user?.email || !user?.sharedWith?.includes(session.user.email)) {
      return Response.json({ error: "Unauthorized" });
    }
  }

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }

  try {
    const result = await addRecipeToWeekly(_id, owner || session.user?.id);

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
