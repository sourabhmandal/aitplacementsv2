import { createPresignedUrlInput } from "../../../../schema/notice.schema";
import { REACT_APP_AWS_BUCKET_ID } from "../../../../utils/constants";
import { createRouter } from "../createRouter";
import { S3Instance } from "../s3_instance";

export const attachmentRouter = createRouter().mutation(
  "create-presigned-url",
  {
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
  }
);
