import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const isGoogleAuthConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
  process.env.GOOGLE_CLIENT_ID !== "your-google-oauth-client-id" &&
  process.env.GOOGLE_CLIENT_SECRET !== "your-google-oauth-client-secret";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: isGoogleAuthConfigured
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
      ]
    : [],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub);
      }
      return session;
    }
  }
};
