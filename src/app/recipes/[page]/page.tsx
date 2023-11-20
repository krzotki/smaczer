import { AddRecipeButton } from "@/components/AddRecipeButton";
import { RecipesList } from "@/components/RecipesList";
import { getRecipes } from "@/recipes/getRecipes";

export default async function Recipes({
  params,
}: {
  params: { page: number };
}) {
  const recipes = await getRecipes(params.page);
  return (
    <>
      <RecipesList recipes={recipes} page={Number(params.page)} />
      <AddRecipeButton />
    </>
  );
}
