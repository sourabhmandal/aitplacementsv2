import { createRouter } from "../createRouter";
import { attachmentRouter } from "./attachment.router";
import { noticeRouter } from "./notice.router";
import { userRouter } from "./user.router";

export const appRouter = createRouter()
  .middleware(async ({ path, type, next }) => {
    const start = Date.now();
    const result = await next();
    const durationMs = Date.now() - start;
    console.log(`RESULT :: ${result}`);
    result.ok
      ? console.log(
          `OK request timing ::: PATH: ${path}, TYPE: ${type}, DURATION: ${durationMs}`,
          path,
          type,
          durationMs
        )
      : console.log(
          `NOT-OK request timing ::: PATH: ${path}, TYPE: ${type}, DURATION: ${durationMs}`,
          path,
          type,
          durationMs
        );
    return result;
  })
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
