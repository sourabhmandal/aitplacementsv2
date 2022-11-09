import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../utils/prisma";

export function createContext({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  // enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // another common pattern
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin!);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  // accept options
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  return {
    req,
    res,
    prisma,
  };
}

export type Context = ReturnType<typeof createContext>;
