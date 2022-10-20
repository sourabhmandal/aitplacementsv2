import aws from "aws-sdk";
import {
  REACT_APP_AWS_ACCESS_KEY,
  REACT_APP_AWS_REGION,
  REACT_APP_AWS_SECRET_ACCESS_KEY,
} from "../../../constants";

class AwsLibInstance {
  private s3_instance: aws.S3;

  constructor() {
    this.s3_instance = new aws.S3({
      credentials: {
        accessKeyId: REACT_APP_AWS_ACCESS_KEY!,
        secretAccessKey: REACT_APP_AWS_SECRET_ACCESS_KEY!,
      },
      region: REACT_APP_AWS_REGION,
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
}

export const S3Instance = new AwsLibInstance();
