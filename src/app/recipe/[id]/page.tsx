import { Recipe as RecipeView } from "@/components/Recipe";
import { getRecipe } from "@/recipes/getRecipes";
import { Flex, Headline } from "brainly-style-guide";
import Image from "next/image";

export default async function Recipe({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);
  return <RecipeView recipe={recipe} />;
}
