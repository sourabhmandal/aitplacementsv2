import { Admin, Student } from "@prisma/client";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../utils/prisma";

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Ait Placements",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "College Email",
          type: "email",
          placeholder: "sourabh@aitpune.edu.in",
        },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials, req) {
        if (credentials?.role == "admin") {
          const user: Admin | null = await prisma.admin.findFirst({
            where: {
              email: credentials?.email,
              password: credentials?.password,
            },
          });
          return user;
        } else {
          const user: Student | null = await prisma.student.findFirst({
            where: {
              email: credentials?.email,
              password: credentials?.password,
            },
          });
          return user;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      return session;
    },
    //----------------------------------------------------------------
    async signIn({ user, account, profile, email, credentials }) {
      if (!user?.emailVerified) {
        return false;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/auth/signout",
    error: "/auth/error", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    newUser: "/register", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
});
