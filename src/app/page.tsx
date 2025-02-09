import { auth } from "@/auth";
import { getUsersThatAreSharingWithMe } from "@/auth/users";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;

  if (session?.user?.email) {
    const sharedWithMe = await getUsersThatAreSharingWithMe(session.user.email);

    if (sharedWithMe.length > 0) {
      redirect(`/weekly/${sharedWithMe[0].id}`);
    }
  }

  redirect(`/weekly/${userId}`);
}
