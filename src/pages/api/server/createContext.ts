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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // accepts OPTIONS
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  return {
    req,
    res,
    prisma,
  };
}

export type Context = ReturnType<typeof createContext>;
