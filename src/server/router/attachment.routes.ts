import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import {
  createPresignedUrlInput,
  deleteNoticeByFileIdInput,
  deleteNoticeByFileIdOutput,
  DeleteNoticeOutput,
} from "../../schema/notice.schema";
import { AIT_AWS_BUCKET_ID } from "../../utils/constants";
import { handlePrismaError } from "../../utils/prisma.errors";
import { S3Instance } from "../s3_instance";
import { publicProcedure, router } from "../trpc";

export const attachmentRouter = router({
  createPresignedUrl: publicProcedure
    .input(createPresignedUrlInput)
    .mutation(({ ctx, input }) => {
      const { filepath } = input;
      // only admin is allowed to invite users
      if (
        (ctx.session?.user.role == "ADMIN" ||
          ctx.session?.user.role == "SUPER_ADMIN") &&
        ctx.session?.user.userStatus == "ACTIVE"
      ) {
        return new Promise((resolve, reject) => {
          S3Instance.GetS3().createPresignedPost(
            {
              Bucket: AIT_AWS_BUCKET_ID,
              Conditions: [["starts-with", "$Content-Type", ""]],
              Fields: {
                key: filepath,
              },
              Expires: 60,
            },
            (err: any, signed: any) => {
              if (err) return reject(err);
              resolve(signed);
            }
          );
        });
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          cause: "Improper authorization",
          message:
            "only admins and super admins are allowed to make the request",
        });
      }
    }),
  deleteAttachmentByFileid: publicProcedure
    .input(deleteNoticeByFileIdInput)
    .output(deleteNoticeByFileIdOutput)
    .mutation(async ({ ctx, input }) => {
      let response: DeleteNoticeOutput = { isDeleted: false };
      let filepath = `${input.noticeId}/${input.filename}`;
      try {
        // only admin is allowed to invite users
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          await S3Instance.DeleteFileByFileId(filepath);
          await ctx?.prisma.attachments.delete({
            where: {
              fileid: filepath,
            },
          });
          response.isDeleted = true;
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message:
              "only admins and super admins are allowed to make the request",
          });
        }
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          handlePrismaError(e);
        }
        console.log(e);
      }

      return response;
    }),
});
