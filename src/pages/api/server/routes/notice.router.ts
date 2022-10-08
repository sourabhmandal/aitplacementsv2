import { Notice } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import {
  createNoticeInput,
  createNoticeOutput,
  getNoticeDetailInput,
  GetNoticeDetailOutput,
  getNoticeDetailOutput,
  getNoticeListInput,
  getNoticeListOutput,
} from "../../../../schema/notice.schema";
import { createRouter } from "../createRouter";
import { prismaError } from "../errors/prisma.errors";
import { S3Instance } from "../s3_instance";

export const noticeRouter = createRouter()
  .mutation("create-notice", {
    input: createNoticeInput,
    output: createNoticeOutput,
    async resolve({ ctx, input }) {
      const { adminEmail, attachments, body, isPublished, tags, title } = input;

      console.log(adminEmail);
      try {
        const dbRespNotice: Notice = await ctx.prisma.notice.create({
          data: {
            body: body,
            title: title,
            isPublished: isPublished,
            tags: tags,
            attachments: {
              create: attachments.map((atth) => ({
                fileid: atth.fileid,
                filename: atth.filename,
                filetype: atth.filetype,
              })),
            },
            admin: {
              connect: {
                email: adminEmail,
              },
            },
          },
          include: {
            admin: true,
            attachments: true,
          },
        });

        return {
          adminEmail: dbRespNotice.adminEmail,
          isPublished: dbRespNotice.isPublished,
          title: dbRespNotice.title,
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
    async resolve({ ctx, input }): Promise<GetNoticeDetailOutput> {
      const { id } = input;
      let atthUrls: { url: string; name: string; type: string }[] = new Array<{
        url: string;
        name: string;
        type: string;
      }>(0);
      try {
        const dbRespNotice = await ctx.prisma.notice.findUnique({
          where: {
            id: id,
          },
          include: {
            admin: {
              select: {
                email: true,
                name: true,
              },
            },
            attachments: {
              select: {
                id: true,
                fileid: true,
                filename: true,
                filetype: true,
              },
            },
          },
        });
        if (dbRespNotice?.attachments && dbRespNotice.attachments.length > 0) {
          for (let file of dbRespNotice.attachments) {
            const url = await S3Instance.GetS3().getSignedUrlPromise(
              "getObject",
              {
                Bucket: process.env.REACT_APP_AWS_BUCKET_ID,
                Key: `${file.fileid}`,
              }
            );

            atthUrls.push({
              url: url,
              name: file.filename,
              type: file.filetype,
            });
          }
        }

        if (dbRespNotice) {
          return {
            id: dbRespNotice.id,
            title: dbRespNotice.title,
            tags: dbRespNotice.tags,
            body: dbRespNotice.body,
            isPublished: dbRespNotice.isPublished,
            attachments: atthUrls,
          };
        }
      } catch (e) {
        console.log(e);
        if (e instanceof PrismaClientKnownRequestError) {
          throw prismaError(e);
        }
      }

      // default response
      return {
        id: "",
        tags: new Array<string>(0),
        isPublished: true,
        title: "",
        body: "",
        attachments: atthUrls,
      };
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
