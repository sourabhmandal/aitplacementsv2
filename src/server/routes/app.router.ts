import { createRouter } from "../createRouter";
import { authRouter } from "./auth.router";
import { noticeRouter } from "./notice.router";

export const appRouter = createRouter()
  .merge("auth.", authRouter)
  .merge("notice.", noticeRouter);

export type AppRouter = typeof appRouter;
