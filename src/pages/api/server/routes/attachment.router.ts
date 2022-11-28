import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import {
  createPresignedUrlInput,
  deleteNoticeByFileIdInput,
  deleteNoticeByFileIdOutput,
  DeleteNoticeOutput,
} from "../../../../schema/notice.schema";
import { REACT_APP_AWS_BUCKET_ID } from "../../../../utils/constants";
import { createRouter } from "../createRouter";
import { handlePrismaError } from "../errors/prisma.errors";
import { S3Instance } from "../s3_instance";

export const attachmentRouter = createRouter()
  .mutation("create-presigned-url", {
    input: createPresignedUrlInput,
    async resolve({ ctx, input }) {
      const { filepath } = input;

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
          (err, signed) => {
            if (err) return reject(err);
            resolve(signed);
          }
        );
      });
    },
  })
  .mutation("delete-attachment-by-fileid", {
    input: deleteNoticeByFileIdInput,
    output: deleteNoticeByFileIdOutput,
    async resolve({ input, ctx }) {
      let response: DeleteNoticeOutput = { isDeleted: false };
      let filepath = `${input.noticeId}/${input.filename}`;
      try {
        await S3Instance.DeleteFileByFileId(filepath);
        await ctx?.prisma.attachments.delete({
          where: {
            filepath: filepath,
          },
        });
        response.isDeleted = true;
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          handlePrismaError(e);
        }
        console.log(e);
      }

      return response;
    },
  });
