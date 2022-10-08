import { Octokit } from "octokit";

class OctokitLibInstance {
  private octokit_instance: Octokit;

  constructor() {
    this.octokit_instance = new Octokit({
      auth: process.env.REACT_APP_GITHUB_ACCESS_TOKEN,
    });
  }

  GetS3(): Octokit {
    if (this.octokit_instance) return this.octokit_instance;
    else {
      throw new Error("Cannot instantiate S3 bucket access");
    }
  }

  async SaveFile(
    fileData: string,
    filename: string,
    noticeid: string
  ): Promise<SavedFileOctokit | undefined> {
    console.log(filename, noticeid);
    const filepath = `${noticeid}/${filename}`;
    try {
      let octResponse =
        await this.octokit_instance.rest.repos.createOrUpdateFileContents({
          owner: "sourabhmandal",
          repo: "ait-placement-notices",
          path: `${noticeid}/${new Date().getMilliseconds()}-${filename}`,
          branch: "main",
          message: `Commit :: Create ${filepath}`,
          content: fileData,
        });

      if (octResponse.status == 201) {
        console.log("file saved");
      }
      return {
        filepath: filepath,
        sha: octResponse.data.content?.sha!,
        downloadUrl: octResponse.data.content?.download_url!,
      };
    } catch (err) {
      // @ts-ignore
      if (err.status == 422) {
        console.log("file alread exist");
      } else console.log(err);
    }
  }
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

export const OctokitInstance = new OctokitLibInstance();
