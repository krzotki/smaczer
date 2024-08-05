import { auth } from "@/auth";
import { getUser } from "@/auth/users";
import { AddRecipeButton } from "@/components/AddRecipeButton";
import { AppLayout } from "@/components/AppLayout";
import { ExportShoppingListButton } from "@/components/ExportShoppingListButton";
import { Header } from "@/components/Header";

import { RecipesList } from "@/components/RecipesList";
import { RollWeeklyRecipesButton } from "@/components/RollWeeklyRecipesButton";
import { getAllRecipes } from "@/recipes/getRecipes";
import { COLLECTION_WEEKLY_RECIPES } from "@/recipes/rollRecipes";
import { Box, Flex, Headline, TextBit } from "brainly-style-guide";

export const dynamic = "force-dynamic";

export default async function Weekly({
  params,
}: {
  params: { userId: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;
  console.log({ session });

  const getPage = async (owner: boolean) => {
    const recipes = await getAllRecipes(
      COLLECTION_WEEKLY_RECIPES,
      params.userId
    );

    return (
      <AppLayout header={<Header />}>
        <Flex marginTop="m" marginBottom="m" justifyContent="center">
          <Box padding="m">
            <TextBit color="text-white" size={["small"]}>
              Pomysły na ten tydzień od {session?.user?.name}
            </TextBit>
          </Box>
        </Flex>
        <RecipesList recipes={recipes} weeklyRecipes />
        {owner && (
          <Flex
            fullWidth
            justifyContent="center"
            direction={["column", "row"]}
            alignItems={["center", "flex-start"]}
          >
            <ExportShoppingListButton />
            <RollWeeklyRecipesButton />
          </Flex>
        )}
        <AddRecipeButton />
      </AppLayout>
    );
  };

  if (userId === params.userId) {
    return getPage(true);
  }

  const owner = await getUser(params.userId);

  if (!owner) {
    return (
      <AppLayout header={<Header />}>
        <Headline color="text-white">Hmmm, nie ma takiej strony...</Headline>
        <AddRecipeButton />
      </AppLayout>
    );
  }

  const isShared =
    session?.user?.email && owner.sharedWith?.includes(session.user.email);

  if (isShared) {
    return getPage(false);
  }

  return (
    <AppLayout header={<Header />}>
      <Headline color="text-white">
        Nuh uh. Brak dostępu. Poproś o udostepnienie tej listy.
      </Headline>
      <AddRecipeButton />
    </AppLayout>
  );
}
