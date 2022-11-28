import { MiddlewareResult } from "@trpc/server/dist/declarations/src/internals/middlewares";
import { createRouter } from "../createRouter";
import { attachmentRouter } from "./attachment.router";
import { noticeRouter } from "./notice.router";
import { userRouter } from "./user.router";

export const appRouter = createRouter()
  // .middleware(async ({ ctx, next }) => {
  //   ctx?.res.setHeader("Access-Control-Allow-Credentials", "true");
  //   ctx?.res.setHeader(
  //     "Access-Control-Allow-Origin",
  //     ctx?.req?.headers.host?.toString() || "*"
  //   );
  //   ctx?.res.setHeader(
  //     "Access-Control-Allow-Headers",
  //     "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  //   );

  //   // accept options
  //   if (ctx?.req.method == "OPTIONS") ctx.res.writeHead(200);

  //   return next();
  // })
  .middleware(async ({ path, type, next }) => {
    const start = Date.now();
    const result: MiddlewareResult<any> = await next();
    const durationMs = Date.now() - start;
    console.log(
      `[SUCCESS: ${result.ok}]- -[METHOD: ${result.ctx.req.method}]- -[PATH: ${path}]- -[TYPE: ${type}]- -[DURATION: ${durationMs}ms]`,
      path,
      type,
      durationMs
    );
    return result;
  })
  .merge("user.", userRouter)
  .merge("notice.", noticeRouter)
  .merge("attachment.", attachmentRouter);

// const isAuthed = appRouter.middleware(async ({ next, ctx }) => {
//   // only check authorization if enabled
//   if (!ctx.user) {
//     throw new TRPCError({ code: "UNAUTHORIZED" });
//   }
//   return next();
// });
export type AppRouter = typeof appRouter;
