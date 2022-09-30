import { Octokit } from "octokit";

class OctokitLibInstance {
  private octokit;

  constructor() {
    this.octokit = new Octokit({ auth: `personal-access-token123` });
  }

  async GetOctokit() {
    if (this.octokit) {
      return this.octokit;
    }
    this.octokit = new Octokit({
      auth: `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`,
    });
    return this.octokit;
  }

  async GetFiles() {
    if (this.octokit) {
    } else {
      console.log("Email transporter not instantiated");
    }
  }
  async SaveFile(content: string, filename: string, noticeid: string) {
    let contentEncoded = btoa(content);
    const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
      owner: "sourabhmandal",
      repo: "ait-placement-notices",
      path: noticeid + "/" + filename,
      message: `create: Added ${filename} programatically`,
      content: contentEncoded,
      committer: {
        name: `Octokit Bot`,
        email: "19mandal97@gmail.com",
      },
      author: {
        name: "Octokit Bot",
        email: "19mandal97@gmail.com",
      },
    });

    console.log(data);
  }
}

export const OctokitInstance = new OctokitLibInstance();
