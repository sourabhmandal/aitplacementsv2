import { createReactQueryHooks } from "@trpc/react";
import { AppRouter } from "../pages/api/server/routes/app.router";
export const trpc = createReactQueryHooks<AppRouter>();
