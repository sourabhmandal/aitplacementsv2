import * as trpcNext from "@trpc/server/adapters/next";
import { createContext } from "../../../server/createContext";
import { appRouter } from "../../../server/routes/app.router";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
  onError({ error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.log(
        `ERROR ${error.code} :: (${error.name}) ${error.message}, CAUSE : ${error.cause}`
      );
    } else {
      console.error(error);
    }
  },
});
