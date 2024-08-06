import { auth, getUser } from "@/auth";
import {
  removeRecipePermanently,
  removeWeeklyRecipe,
} from "@/recipes/removeRecipe";

export async function POST(request: Request) {
  const body = await request.json();
  const type = body.type;
  const _id = body._id;
  const owner = body.owner;
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }

  if (owner) {
    const user = await getUser(owner);

    if (
      !session?.user?.email ||
      !user?.sharedWith?.includes(session.user.email)
    ) {
      return Response.json({ error: "Unauthorized" });
    }
  }

  try {
    if (type === "weekly") {
      const result = await removeWeeklyRecipe(_id, owner || session.user.id);
      return Response.json(result);
    }

    const result = await removeRecipePermanently(_id, session.user.id);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
