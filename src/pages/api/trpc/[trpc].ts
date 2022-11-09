import * as trpcNext from "@trpc/server/adapters/next";
import { createContext } from "../server/createContext";
import { appRouter } from "../server/routes/app.router";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
  onError({ error }) {
    // "BAD_REQUEST" | "INTERNAL_SERVER_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "METHOD_NOT_SUPPORTED" | "TIMEOUT" | "CONFLICT" | "PRECONDITION_FAILED"
    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.log(`ERROR ${error.code} :: (${error.name}) ${error.message}`);
    } else if (error.code === "PARSE_ERROR") {
      console.log(`ERROR ${error.code} :: (${error.name}) ${error.message}`);
    } else {
      console.log(`ERROR ${error.code} :: (${error.name}) ${error.message}`);
    }
  },
  responseMeta({ data, errors, type, ctx, paths }) {
    const corsHeaders = {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": ctx?.req.headers.host?.toString() || "*",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    };
    console.log(ctx?.req.method, ctx?.res.statusCode);

    // accept options
    if (ctx?.req.method?.toString() === "OPTIONS") {
      return {
        headers: corsHeaders,
        status: 200,
      };
    }
    return {
      headers: corsHeaders,
      status: ctx?.res.statusCode ?? 500,
    };
  },
});
