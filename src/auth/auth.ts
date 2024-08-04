import type {
    GetServerSidePropsContext,
    NextApiRequest,
    NextApiResponse,
  } from "next"
  import type { NextAuthOptions } from "next-auth"
  import { getServerSession } from "next-auth"
  import GoogleProvider from "next-auth/providers/google";

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
  export const authOptions = {
    providers: [
        GoogleProvider({
          clientId,
          clientSecret,
        }),
      ],
      callbacks:{

        session: async ({ session, token }) => {
          session.user = {
            ...session.user,
            id: token.sub,
          }
          return session;
        },
      },
      
  } satisfies NextAuthOptions
  
  // Use it in server contexts
  export function auth(
    ...args:
      | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
      | [NextApiRequest, NextApiResponse]
      | []
  ) {
    return getServerSession(...args, authOptions)
  }