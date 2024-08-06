import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      sharedWith?: string[];
      sharedWithMe?: { id: string; name: string }[];
    } & DefaultSession["user"];
  }
}
