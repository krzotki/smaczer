import { AddRecipeButton } from "@/components/AddRecipeButton";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { RecipesList } from "@/components/RecipesList";
import { getRecipes } from "@/recipes/getRecipes";

export default async function Recipes({
  params,
}: {
  params: { page: number };
}) {
  const recipes = await getRecipes(params.page);
  return (
    <AppLayout header={<Header />}>
      <RecipesList recipes={recipes} page={Number(params.page)} />
      <AddRecipeButton />
    </AppLayout>
  );
}
