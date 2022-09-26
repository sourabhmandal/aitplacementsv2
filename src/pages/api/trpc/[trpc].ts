import * as trpcNext from "@trpc/server/adapters/next";
import { createContext } from "../../../server/createContext";
import { appRouter } from "../../../server/routes/app.router";

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
});
