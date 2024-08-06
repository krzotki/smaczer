import { auth } from "@/auth";

import {
  classifyProducts,
  SchemaType,
} from "@/recipes/shoppingList";

export async function POST(request: Request) {
  const body = await request.json();
  const shoppingList = body.shoppingList;

  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }

  try {
    const classified = await classifyProducts(shoppingList);
    const parsed = JSON.parse(classified) as SchemaType;

    return Response.json({ classified, parsed });
  } catch (e) {
    return Response.json({ error: e });
  }
}
