import { auth } from "@/auth";
import { getUser } from "@/auth/users";
import { AddRecipeButton } from "@/components/AddRecipeButton";
import { AppLayout } from "@/components/AppLayout";
import { ExportShoppingListButton } from "@/components/ExportShoppingListButton";
import { Header } from "@/components/Header";

import { RecipesList } from "@/components/RecipesList";
import { RollWeeklyRecipesButton } from "@/components/RollWeeklyRecipesButton";
import { getMappedWeeklyRecipes } from "@/recipes/getRecipes";
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

  const getPage = async (userId: string) => {
    const recipes = await getMappedWeeklyRecipes(userId);
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

        <Flex
          fullWidth
          justifyContent="center"
          direction={["column", "row"]}
          alignItems={["center", "flex-start"]}
        >
          <ExportShoppingListButton recipes={recipes} />
          <RollWeeklyRecipesButton />
        </Flex>

        <AddRecipeButton />
      </AppLayout>
    );
  };

  if (userId === params.userId) {
    return getPage(userId);
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
    return getPage(owner.id);
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
