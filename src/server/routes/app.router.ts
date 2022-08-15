import { createRouter } from "../createRouter";
import { authRouter } from "./auth.router";

export const appRouter = createRouter().merge("auth.", authRouter);

export type AppRouter = typeof appRouter;
