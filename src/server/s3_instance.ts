import aws from "aws-sdk";
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../utils/constants";

class AwsLibInstance {
  private s3_instance: aws.S3;

  constructor() {
    this.s3_instance = new aws.S3({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
      },
      region: AWS_REGION,
    });
  }

  GetS3(): aws.S3 {
    if (this.s3_instance) return this.s3_instance;
    else {
      throw new Error("Cannot instantiate S3 bucket access");
    }
  }

  async SaveFile(fileData: string, filename: string, noticeid: string) {}
  // async DeleteFile(noticeid: string) {
  //   try {
  //     let octResponse = await this.octokit_instance.rest.repos.deleteFile({
  //       owner: "sourabhmandal",
  //       repo: "ait-placement-notices",
  //       path: `${filepath}`,
  //       branch: "main",
  //       message: `Commit :: Delete ${filepath}`,
  //       sha: "",
  //     });
  //     if (octResponse.status == 200) {
  //       console.log("file deleted");
  //     }
  //   } catch (err) {
  //     // @ts-ignore
  //     if (err.status == 422) {
  //       console.log("file alread exist");
  //     } else console.log(err);
  //   }
  // }

  async DeleteFileByFileId(fileid: string) {
    this.s3_instance.deleteObject(
      {
        Bucket: AWS_BUCKET_ID!,
        Key: `${fileid}`,
      },
      (err, data) => {
        console.log(data, err);
      }
    );
  }

  async UploadFile(fileid: string) {
    this.s3_instance.deleteObject(
      {
        Bucket: AWS_BUCKET_ID!,
        Key: `${fileid}`,
      },
      (err, data) => {
        console.log(data, err);
      }
    );
  }
}

export const S3Instance = new AwsLibInstance();
