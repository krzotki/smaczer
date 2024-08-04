import { auth } from "@/auth";
import { addRecipeToWeekly } from "@/recipes/addRecipe";

export async function POST(request: Request) {
  const body = await request.json();
  const _id = body._id;
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }
  
  try {
    const result = await addRecipeToWeekly(_id, session.user?.id);

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e });
  }
}
