import { Client, isNotionClientError } from "@notionhq/client";
import { GetPageResponse } from "@notionhq/client/build/src/api-endpoints";
import { NoticeMetadata } from "../../../schema/notice.schema";
import { handleNotionErrors } from "./errors/notion.errors";

class NotionInstance {
  public notionClient: Client;
  private database_id: string;
  private notion_app_id: string;

  constructor() {
    this.database_id = process.env.NOTION_DATABASE_ID || "";
    this.notion_app_id = process.env.NOTION_ACCESS_TOKEN || "";

    this.notionClient = new Client({
      auth: process.env.NOTION_APP_ID,
      timeoutMs: 60_000,
    });
  }

  async CreateNotice(fileData: string, filename: string, noticeid: string) {
    // await this.notionClient.databases.create({
    // })
  }

  async GetAllPublishedNotice(): Promise<NoticeMetadata[]> {
    let response: NoticeMetadata[] = new Array<NoticeMetadata>(0);
    try {
      const database_page_list = await this.notionClient.databases.query({
        database_id: this.database_id,
        auth: this.notion_app_id,
        filter: {
          property: "status",
          select: {
            equals: "published",
          },
        },
      });

      const pages: GetPageResponse[] = await Promise.all(
        database_page_list.results.map((pageRef): Promise<GetPageResponse> => {
          return this.notionClient.pages.retrieve({
            page_id: pageRef.id,
            auth: this.notion_app_id,
          });
        })
      );

      response = pages.map(
        (p): NoticeMetadata => ({
          id: p.id, //@ts-ignore
          title: p.properties["Name"].title[0].plain_text, //@ts-ignore
          admin: p.properties["admin email"].email, //@ts-ignore
          tags: p.properties["Tags"].multi_select, //@ts-ignore
          updatedAt: p.properties["Updated"].last_edited_time,
        })
      );
      return response;
    } catch (error: unknown) {
      if (isNotionClientError(error)) {
        handleNotionErrors(error);
      }
    }
    return response;
  }
}

export const NotionProvider = new NotionInstance();
