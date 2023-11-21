import { AddRecipeButton } from "@/components/AddRecipeButton";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { RecipesList } from "@/components/RecipesList";
import { gerRandomRecipesForWeek } from "@/recipes/getRecipes";
import { Box, Flex, Headline, TextBit } from "brainly-style-guide";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recipes = await gerRandomRecipesForWeek(9);
  return (
    <AppLayout header={<Header />}>
      <Flex marginTop="m" marginBottom="m" justifyContent="center">
        <Box padding="xs">
          <TextBit color="text-white" size={["small"]}>
            Pomysły na ten tydzień
          </TextBit>
        </Box>
      </Flex>
      <RecipesList recipes={recipes} />
      <AddRecipeButton />
    </AppLayout>
  );
}
