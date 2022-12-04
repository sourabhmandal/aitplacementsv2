import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { unstable_getServerSession } from "next-auth";
import {
  createPresignedUrlInput,
  deleteNoticeByFileIdInput,
  deleteNoticeByFileIdOutput,
  DeleteNoticeOutput,
} from "../../../../schema/notice.schema";
import { REACT_APP_AWS_BUCKET_ID } from "../../../../utils/constants";
import { authOptions } from "../../auth/[...nextauth]";
import { createRouter } from "../createRouter";
import { handlePrismaError } from "../errors/prisma.errors";
import { S3Instance } from "../s3_instance";

export const attachmentRouter = createRouter()
  .mutation("create-presigned-url", {
    input: createPresignedUrlInput,
    async resolve({ ctx, input }) {
      const { filepath } = input;

      // only admin is allowed to invite users
      const session = await unstable_getServerSession(
        ctx?.req!,
        ctx?.res!,
        authOptions
      );

      if (
        (session?.user.role == "ADMIN" ||
          session?.user.role == "SUPER_ADMIN") &&
        session?.user.userStatus == "ACTIVE"
      ) {
        return new Promise((resolve, reject) => {
          S3Instance.GetS3().createPresignedPost(
            {
              Bucket: REACT_APP_AWS_BUCKET_ID,
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
    },
  })
  .mutation("delete-attachment-by-fileid", {
    input: deleteNoticeByFileIdInput,
    output: deleteNoticeByFileIdOutput,
    async resolve({ input, ctx }) {
      let response: DeleteNoticeOutput = { isDeleted: false };
      let filepath = `${input.noticeId}/${input.filename}`;
      try {
        // only admin is allowed to invite users
        const session = await unstable_getServerSession(
          ctx?.req!,
          ctx?.res!,
          authOptions
        );

        if (
          (session?.user.role == "ADMIN" ||
            session?.user.role == "SUPER_ADMIN") &&
          session?.user.userStatus == "ACTIVE"
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
    },
  });
