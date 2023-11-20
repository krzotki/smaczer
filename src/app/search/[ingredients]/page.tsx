import { AddRecipeButton } from "@/components/AddRecipeButton";
import { RecipesList } from "@/components/RecipesList";
import { getRecipesByIngredients } from "@/recipes/getRecipes";
import React, { Suspense } from "react";
import Loading from "./loading";

export default async function Recipes({
  params,
}: {
  params: { ingredients: string };
}) {
  const parsedIngredients = decodeURIComponent(params.ingredients);
  const recipes = await getRecipesByIngredients(parsedIngredients || "", 8);
  console.log({ recipes, params });
  return (
    <Suspense fallback={<Loading />}>
      <RecipesList recipes={recipes} initialIngredients={parsedIngredients} />
      <AddRecipeButton />
    </Suspense>
  );
}
