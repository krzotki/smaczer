import { AppLayout } from "@/components/AppLayout";
import { EditRecipeForm } from "@/components/EditRecipeForm";
import { Header } from "@/components/Header";
import { Recipe as RecipeView } from "@/components/Recipe";
import { getRecipe } from "@/recipes/getRecipes";
import { Flex, Headline } from "brainly-style-guide";
import { Metadata } from "next";
import Head from "next/head";
import Image from "next/image";

export default async function Recipe({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);
  if (!recipe) {
    return null;
  }
  return (
    <AppLayout header={<Header />}>
      <EditRecipeForm recipeToEdit={recipe} />
    </AppLayout>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const recipe = await getRecipe(params.id);
  if (!recipe) {
    return {};
  }
  return {
    title: recipe.name,
    description: recipe.description,
  };
}
