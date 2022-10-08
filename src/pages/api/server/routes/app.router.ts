import { createRouter } from "../createRouter";
import { adminRouter } from "./admin.router";
import { attachmentRouter } from "./attachment.router";
import { noticeRouter } from "./notice.router";
import { userRouter } from "./user.router";
import { verifyRouter } from "./verify.router";

export const appRouter = createRouter()
  .merge("user.", userRouter)
  .merge("admin.", adminRouter)
  .merge("notice.", noticeRouter)
  .merge("verify.", verifyRouter)
  .merge("attachment.", attachmentRouter);

export type AppRouter = typeof appRouter;
