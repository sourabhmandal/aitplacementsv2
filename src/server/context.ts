import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { prisma } from "../utils/prisma";

export async function createContext(opts: CreateNextContextOptions) {
  // enable CORS
  opts.res.setHeader("Access-Control-Allow-Credentials", "true");
  // another common pattern
  opts.res.setHeader(
    "Access-Control-Allow-Origin",
    opts.req.headers.host || "*"
  );
  opts.res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  opts.res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // only admin is allowed to invite users
  const session = await unstable_getServerSession(
    opts.req,
    opts.res,
    authOptions
  );

  // accept options
  if (opts.req.method === "OPTIONS") {
    opts.res.status(200).end();
    return { prisma, session };
  }

  return {
    prisma,
    session,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
