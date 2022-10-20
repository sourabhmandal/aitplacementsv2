import { createRouter } from "../createRouter";
import { attachmentRouter } from "./attachment.router";
import { noticeRouter } from "./notice.router";
import { userRouter } from "./user.router";

export const appRouter = createRouter()
  .merge("user.", userRouter)
  .merge("notice.", noticeRouter)
  .merge("attachment.", attachmentRouter);

export type AppRouter = typeof appRouter;
