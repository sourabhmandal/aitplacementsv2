import { inferAsyncReturnType } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { createContext } from "../../../server/context";
import { appRouter } from "../../../server/router/_app";

export const config = {
  runtime: "experimental-edge",
};

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
  onError({ error }) {
    // "BAD_REQUEST" | "INTERNAL_SERVER_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "METHOD_NOT_SUPPORTED" | "TIMEOUT" | "CONFLICT" | "PRECONDITION_FAILED"
    console.log(`[ERROR ${error.code}] = (${error.name}) ${error.message}`);
  },
});
export type Context = inferAsyncReturnType<typeof createContext>;
