import { auth } from "@/auth";
import { shareWeeklyWithEmail } from "@/auth/users";

export async function POST(request: Request) {
  const body = await request.json();
  const email = body.email;
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" });
  }

  if (!email) {
    return Response.json({ error: "Email is required" });
  }

  try {
    const result = await shareWeeklyWithEmail(session.user.id, body.email);

    return Response.json(result);
  } catch (e: any) {
    console.log({e})
    return Response.json({ error: e.message });
  }
}
