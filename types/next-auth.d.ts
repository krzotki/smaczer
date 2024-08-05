import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      sharedWith?: string[];
    } & DefaultSession["user"];
  }
}
