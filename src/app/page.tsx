import { AddRecipeButton } from "@/components/AddRecipeButton";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { RecipesList } from "@/components/RecipesList";
import { RollWeeklyRecipesButton } from "@/components/RollWeeklyRecipesButton";
import { getAllRecipes } from "@/recipes/getRecipes";
import { COLLECTION_WEEKLY_RECIPES } from "@/recipes/rollRecipes";
import { Box, Flex, Headline, TextBit } from "brainly-style-guide";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recipes = await getAllRecipes(COLLECTION_WEEKLY_RECIPES);

  return (
    <AppLayout header={<Header />}>
      <Flex marginTop="m" marginBottom="m" justifyContent="center">
        <Box padding="m">
          <TextBit color="text-white" size={["small"]}>
            Pomysły na ten tydzień
          </TextBit>
        </Box>
      </Flex>
      <RecipesList recipes={recipes} weeklyRecipes/>
      <RollWeeklyRecipesButton />
      <AddRecipeButton />
    </AppLayout>
  );
}
