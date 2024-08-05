import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUser, saveUser } from "./users";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId) {
  throw new Error("GOOGLE_CLIENT_ID is not set");
}

if (!clientSecret) {
  throw new Error("GOOGLE_CLIENT_SECRET is not set");
}
// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const existingUser = await getUser(String(token.sub));
      token.savedUser = existingUser;
      return token;
    },
    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        id: token.sub,
        // @ts-ignore
        sharedWith: token.savedUser?.sharedWith || [],
      };
      return session;
    },
    signIn: async ({ user, account, profile }) => {
      const existingUser = await getUser(String(user.id));
      if (!existingUser) {
        await saveUser({
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          photoPath: user.image || "",
        });
      }
      console.log({ existingUser });
      return true;
    },
  },
};

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
