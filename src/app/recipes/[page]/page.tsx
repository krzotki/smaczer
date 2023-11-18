import { RecipesList } from "@/components/RecipesList";
import { getRecipes } from "@/recipes/getRecipes";


export default async function Recipes({
  params,
}: {
  params: { page: number };
}) {
  const recipes = await getRecipes(params.page);
  console.log({ recipes, params });
  return (
    <RecipesList recipes={recipes} page={Number(params.page)}/>
  );
}
