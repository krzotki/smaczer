import { auth } from "@/auth";
import { getUsersThatAreSharingWithMe } from "@/auth/users";

import { getAllRecipes } from "@/recipes/getRecipes";
import { COLLECTION_WEEKLY_RECIPES } from "@/recipes/rollRecipes";

import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;

  if (session?.user?.email) {
    const sharedWithMe = await getUsersThatAreSharingWithMe(session.user.email);

    if (sharedWithMe.length > 0) {
      redirect(`/weekly/${sharedWithMe[0].id}`);
      // return (
      //   <AppLayout header={<Header />}>
      //     <Flex direction="column" gap="s">
      //       <Headline color="text-white">
      //         {sharedWithMe[0].name} dzieli się z Tobą swoimi przepisami
      //       </Headline>
      //       <GoToSharedButton link={`/weekly/${sharedWithMe[0].id}`} />
      //     </Flex>
      //     <AddRecipeButton />
      //   </AppLayout>
      // );
    }
  }

  redirect(`/weekly/${userId}`);
}
