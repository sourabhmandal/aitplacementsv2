import { Notice } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import {
  createNoticeInput,
  createNoticeOutput,
  getNoticeDetailInput,
  getNoticeDetailOutput,
  getNoticeListInput,
  getNoticeListOutput,
} from "../../schema/notice.schema";
import { createRouter } from "../createRouter";
import { prismaError } from "../errors/prisma.errors";

export const noticeRouter = createRouter()
  .mutation("create-notice", {
    input: createNoticeInput,
    output: createNoticeOutput,
    async resolve({ ctx, input }) {
      const { adminEmail, attachments, body, isPublished, tags, title } = input;
      console.log(tags);
      try {
        const dbResp: Notice = await ctx.prisma.notice.create({
          data: {
            body: body,
            title: title,
            adminEmail: adminEmail,
            attachments: attachments,
            isPublished: isPublished,
            tags: tags,
          },
        });
        return {
          adminEmail: dbResp.adminEmail,
          isPublished: dbResp.isPublished,
          title: dbResp.title,
        };
      } catch (e) {
        console.log(e);
        if (e instanceof PrismaClientKnownRequestError) {
          prismaError(e);
        }
      }

      // default response
      return {
        adminEmail: "",
        isPublished: false,
        title: "",
      };
    },
  })
  .query("notice-detail", {
    input: getNoticeDetailInput,
    output: getNoticeDetailOutput,
    async resolve({ ctx, input }) {
      let result = {
        id: "",
        tags: new Array<string>(0),
        isPublished: true,
        title: "",
        body: "",
        attachments: new Array<string>(0),
      };
      const { id } = input;
      try {
        const dbResp: Notice | null = await ctx.prisma.notice.findUnique({
          where: {
            id: id,
          },
        });

        result.id = dbResp?.id!;
        result.body = dbResp?.body!;
        result.title = dbResp?.title!;
        result.tags = dbResp?.tags!;
        result.attachments = dbResp?.attachments!;
        result.isPublished = dbResp?.isPublished!;

        return result;
      } catch (e) {
        console.log(e);
        if (e instanceof PrismaClientKnownRequestError) {
          throw prismaError(e);
        }
      }

      // default response
      return result;
    },
  })
  .query("published-notice-list", {
    input: getNoticeListInput,
    output: getNoticeListOutput,
    async resolve({ ctx, input }) {
      const { pageNos } = input;
      try {
        const noticeLenght: number = await ctx.prisma.notice.count({
          where: {
            isPublished: true,
          },
        });
        const dbResp: Notice[] = await ctx.prisma.notice.findMany({
          where: {
            isPublished: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (pageNos - 1) * 10,
          take: 10,
        });

        const resp = dbResp.map((data) => {
          return {
            id: data.id,
            title: data.title,
            admin: data.adminEmail,
            tags: data.tags,
            updatedAt: data.updatedAt,
          };
        });
        return { totalNotice: noticeLenght, notices: resp };
      } catch (e) {
        console.log(e);
        if (e instanceof PrismaClientKnownRequestError) {
          throw prismaError(e);
        }
      }

      // default response
      return {
        totalNotice: 0,
        notices: [
          {
            id: "",
            admin: "",
            tags: [""],
            title: "",
            updatedAt: new Date(),
          },
        ],
      };
    },
  });
