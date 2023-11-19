import { RecipesList } from "@/components/RecipesList";
import { getRecipes, getRecipesByIngredients } from "@/recipes/getRecipes";
import { useSearchParams } from "next/navigation";
import React from "react";

export default async function Recipes({
  params,
}: {
  params: { ingredients: string };
}) {
  const recipes = await getRecipesByIngredients(params.ingredients || "", 8);
  console.log({recipes})
  return <RecipesList recipes={recipes} />;
}
