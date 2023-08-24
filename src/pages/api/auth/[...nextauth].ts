import { User } from "@prisma/client";
import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../utils/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  // Configure one or more authentication providers
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      checks: "none",
    }),
    CredentialsProvider({
      id: "update-user",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials, req) {
        const user = await prisma?.user.findFirst({
          where: {
            email: credentials?.email,
          },
        });

        // If no error and we have user data, return it
        if (user) {
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      const dbUser: User | undefined | null = await prisma?.user.findFirst({
        where: {
          email: token.email!,
        },
      });
      session.user.role = dbUser?.role;
      session.user.userStatus = dbUser?.userStatus;
      // Send properties to the client, like an access_token from a provider.
      return session;
    },
    //----------------------------------------------------------------
    async signIn({ user, account, profile, email, credentials }) {
      const dbUser = await prisma?.user.findFirst({
        where: {
          email: user.email!,
        },
      });
      if (dbUser && dbUser.email != "") {
        return true;
      }

      return false;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/auth-error", // Error code passed in query string as ?error=
  },
};

export default NextAuth(authOptions);
