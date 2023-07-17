import { publicProcedure, router } from "../trpc";
import { attachmentRouter } from "./attachment.routes";
import { noticeRouter } from "./notice.routes";
import { userRouter } from "./user.routes";

export const appRouter = router({
  ping: publicProcedure.query(() => {
    return {
      greeting: `pong`,
    };
  }),
  user: userRouter,
  notice: noticeRouter,
  attachment: attachmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
