import { AddRecipeButton } from "@/components/AddRecipeButton";
import { RecipesList } from "@/components/RecipesList";
import { getRecipesBySimilarity } from "@/recipes/getRecipes";
import React, { Suspense } from "react";
import Loading from "./loading";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Flex, Box, TextBit } from "brainly-style-guide";
import { auth } from "@/auth";

export default async function Recipes({
  params,
}: {
  params: { ingredients: string };
}) {
  const parsedIngredients = decodeURIComponent(params.ingredients);
  const session = await auth();
  const recipes = await getRecipesBySimilarity(parsedIngredients || "", 20, session);

  return (
    <Suspense fallback={<Loading />}>
      <AppLayout
        header={<Header initialIngredients={parsedIngredients}></Header>}
      >
        <Flex marginBottom="xs" marginTop="xs" justifyContent="center">
          <Box padding="xs">
            <TextBit color="text-white" size={["small", "medium"]}>
              Znalezione przepisy
            </TextBit>
          </Box>
        </Flex>
        <RecipesList recipes={recipes} />
        <AddRecipeButton />
      </AppLayout>
    </Suspense>
  );
}
