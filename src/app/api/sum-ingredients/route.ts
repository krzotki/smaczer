import { auth } from "@/auth";

import { sumProducts } from "@/recipes/shoppingList";

export async function POST(request: Request) {
  const body = await request.json();
  const nextIngredients = body.nextIngredients;
  const currentSum = body.currentSum;

  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }

  try {
    const summed = await sumProducts(currentSum, nextIngredients);

    return Response.json({ summed });
  } catch (e) {
    return Response.json({ error: e });
  }
}
