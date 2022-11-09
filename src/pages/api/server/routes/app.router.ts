import { createRouter } from "../createRouter";
import { attachmentRouter } from "./attachment.router";
import { noticeRouter } from "./notice.router";
import { userRouter } from "./user.router";

export const appRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    ctx?.res.setHeader("Access-Control-Allow-Credentials", "true");
    ctx?.res.setHeader(
      "Access-Control-Allow-Origin",
      ctx?.req?.headers.host?.toString() || "*"
    );
    ctx?.res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    // accept options
    if (ctx?.req.method == "OPTIONS") ctx.res.writeHead(200);

    return next();
  })
  .merge("user.", userRouter)
  .merge("notice.", noticeRouter)
  .merge("attachment.", attachmentRouter);

export type AppRouter = typeof appRouter;
