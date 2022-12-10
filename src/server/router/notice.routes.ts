import { Notice } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import {
  changeNoticeStatusInput,
  ChangeNoticeStatusOutput,
  changeNoticeStatusOutput,
  createNoticeInput,
  CreateNoticeOutput,
  createNoticeOutput,
  deleteNoticeInput,
  DeleteNoticeOutput,
  deleteNoticeOutput,
  getNoticeDetailInput,
  getNoticeDetailOutput,
  getNoticeListInput,
  GetNoticeListOutput,
  getNoticeListOutput,
  NoticeMetadata,
  noticeSearchInput,
  userNoticeInput,
  UserNoticeOutput,
  userNoticeOutput,
} from "../../schema/notice.schema";
import { REACT_APP_AWS_BUCKET_ID } from "../../utils/constants";
import { handlePrismaError } from "../../utils/prisma.errors";
import { S3Instance } from "../s3_instance";
import { publicProcedure, router } from "../trpc";

export const noticeRouter = router({
  createNotice: publicProcedure
    .input(createNoticeInput)
    .output(createNoticeOutput)
    .mutation(async ({ ctx, input }) => {
      const { adminEmail, attachments, body, isPublished, tags, title, id } =
        input;

      let response: CreateNoticeOutput = {
        adminEmail: "",
        isPublished: false,
        title: "",
      };
      try {
        // only admin is allowed to invite users
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          const dbUser = await ctx?.prisma.user.findFirst({
            where: {
              email: adminEmail,
            },
          });

          if (dbUser?.role == "ADMIN" || dbUser?.role == "SUPER_ADMIN") {
            const dbRespNotice: Notice = await ctx?.prisma?.notice?.create({
              data: {
                id: id,
                body: body,
                title: title,
                isPublished: isPublished,
                tags: tags,
                attachments: {
                  create: attachments,
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
            })!;

            response = {
              adminEmail: dbRespNotice.adminEmailFk,
              isPublished: dbRespNotice.isPublished,
              title: dbRespNotice.title,
            };
          }
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message:
              "only admins and super admins are allowed to make the request",
          });
        }
      } catch (e) {
        console.log(e);
        if (e instanceof PrismaClientKnownRequestError) {
          handlePrismaError(e);
        }
      }
      // default response
      return response;
    }),
  updateNotice: publicProcedure
    .input(createNoticeInput)
    .output(createNoticeOutput)
    .mutation(async ({ ctx, input }) => {
      const { adminEmail, attachments, body, isPublished, tags, title, id } =
        input;
      let response: CreateNoticeOutput = {
        adminEmail: "",
        isPublished: false,
        title: "",
      };
      try {
        // only admin is allowed to invite users
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          const dbUser = await ctx?.prisma.user.findFirst({
            where: {
              email: adminEmail,
            },
          });

          if (dbUser?.role == "ADMIN" || dbUser?.role == "SUPER_ADMIN") {
            // upsert attachments first
            attachments.forEach(async (atth) => {
              await ctx?.prisma.attachments.upsert({
                create: {
                  fileid: atth.fileid,
                  filename: atth.filename,
                  filetype: atth.filetype,
                  noticeid: id,
                },
                update: {
                  fileid: atth.fileid,
                  filename: atth.filename,
                  filetype: atth.filetype,
                  noticeid: id,
                },
                where: {
                  fileid: atth.fileid,
                },
                select: {
                  fileid: true,
                },
              });
            });
            // upsert notice
            const dbRespNotice: Notice = await ctx?.prisma?.notice?.update({
              where: {
                id: id,
              },
              data: {
                body: body,
                title: title,
                isPublished: isPublished,
                tags: tags,
                admin: {
                  connect: {
                    email: adminEmail,
                  },
                },
              },
            })!;

            response = {
              adminEmail: dbRespNotice.adminEmailFk,
              isPublished: dbRespNotice.isPublished,
              title: dbRespNotice.title,
            };
          }
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message:
              "only admins and super admins are allowed to make the request",
          });
        }
      } catch (e) {
        console.log(e);
        if (e instanceof PrismaClientKnownRequestError) {
          handlePrismaError(e);
        }
      }
      // default response
      return response;
    }),
  noticeDetail: publicProcedure
    .input(getNoticeDetailInput)
    .output(getNoticeDetailOutput)
    .query(async ({ ctx, input }) => {
      const { id } = input;
      let atthUrls: { url: string; name: string; type: string }[] = new Array<{
        url: string;
        name: string;
        type: string;
      }>(0);

      let response = {
        id: "",
        tags: new Array<string>(0),
        isPublished: true,
        title: "",
        body: "",
        attachments: atthUrls,
      };
      try {
        // only admin is allowed to invite users
        if (ctx.session?.user.userStatus == "ACTIVE") {
          const dbRespNotice = await ctx?.prisma.notice.findUnique({
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
                  fileid: true,
                  filename: true,
                  filetype: true,
                },
              },
            },
          });
          if (
            dbRespNotice?.attachments &&
            dbRespNotice.attachments.length > 0
          ) {
            for (let file of dbRespNotice.attachments) {
              const url = await S3Instance.GetS3().getSignedUrlPromise(
                "getObject",
                {
                  Bucket: REACT_APP_AWS_BUCKET_ID,
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
            response = {
              id: dbRespNotice.id,
              title: dbRespNotice.title,
              tags: dbRespNotice.tags,
              body: dbRespNotice.body,
              isPublished: dbRespNotice.isPublished,
              attachments: atthUrls,
            };
          }
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message: "only active users are allowed to make the request",
          });
        }
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          throw handlePrismaError(e);
        }
        console.log(e);
      }

      // default response
      return response;
    }),
  publishedNoticeList: publicProcedure
    .input(getNoticeListInput)
    .output(getNoticeListOutput)
    .query(async ({ ctx, input }) => {
      const { pageNos } = input;
      let response: GetNoticeListOutput = {
        notices: [],
        totalNotice: 0,
      };

      try {
        // only admin is allowed to invite users
        if (ctx.session?.user.userStatus == "ACTIVE") {
          const noticeLenght: number = await ctx?.prisma.notice.count({
            where: {
              isPublished: true,
            },
          })!;
          const dbResp: Notice[] = await ctx?.prisma.notice.findMany({
            where: {
              isPublished: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            skip: (pageNos - 1) * 10,
            take: 10,
          })!;

          const resp: NoticeMetadata[] = dbResp.map((data) => {
            return {
              id: data.id,
              title: data.title,
              admin: data.adminEmailFk,
              tags: data.tags,
              updatedAt: data.updatedAt.toDateString(),
            };
          });
          response = {
            totalNotice: noticeLenght,
            notices: resp,
          };
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message: "only active users are allowed to make the request",
          });
        }
      } catch (e) {
        console.log(e);
        if (e instanceof PrismaClientKnownRequestError) {
          throw handlePrismaError(e);
        }
      }
      // default response
      return response;
    }),
  myNotices: publicProcedure
    .input(userNoticeInput)
    .output(userNoticeOutput)
    .query(async ({ ctx, input }) => {
      let response: UserNoticeOutput = {
        count: 0,
        notice: [],
      };
      try {
        // only admin is allowed to invite users
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          const dbNoticeCount = await ctx?.prisma.notice.count({
            where: {
              adminEmailFk: ctx.session.user.email,
            },
          })!;
          const dbNotice = await ctx?.prisma.notice.findMany({
            where: {
              adminEmailFk: ctx.session.user.email,
            },
            select: {
              id: true,
              isPublished: true,
              title: true,
              updatedAt: true,
            },
            orderBy: {
              updatedAt: "desc",
            },
            take: 10,
            skip: (input.pageNos - 1) * 10,
          });

          const respNotice: NoticeMetadata[] = dbNotice?.map(
            (notice): NoticeMetadata => ({
              id: notice.id,
              title: notice.title,
              updatedAt: notice.updatedAt.toDateString(),
              isPublished: notice.isPublished,
            })
          )!;

          response = {
            notice: respNotice,
            count: dbNoticeCount,
          };
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
    }),
  changeNoticeStatus: publicProcedure
    .input(changeNoticeStatusInput)
    .output(changeNoticeStatusOutput)
    .mutation(async ({ ctx, input }) => {
      let response: ChangeNoticeStatusOutput = {
        isPublished: false,
      };
      try {
        // only admin is allowed to invite users
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          await ctx?.prisma.notice.update({
            data: {
              isPublished: input.isPublished,
            },
            where: {
              id: input.noticeId,
            },
          });
          response = { isPublished: input.isPublished };
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
    }),
  deleteNotice: publicProcedure
    .input(deleteNoticeInput)
    .output(deleteNoticeOutput)
    .mutation(async ({ ctx, input }) => {
      let response: DeleteNoticeOutput = { isDeleted: false };
      try {
        // only admin is allowed to invite users
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          const noticeToDelete = await ctx?.prisma.notice.findFirst({
            where: {
              id: input.noticeId,
            },
            select: {
              _count: true,
              attachments: true,
            },
          });

          // delete all attachment
          await ctx?.prisma.notice.update({
            where: {
              id: input.noticeId,
            },
            data: {
              attachments: {
                deleteMany: {},
              },
            },
          });

          if (
            noticeToDelete?._count.attachments &&
            noticeToDelete?._count.attachments > 0
          ) {
            console.log("files found");
            for (let file of noticeToDelete?.attachments) {
              await S3Instance.DeleteFileByFileId(file.fileid);
            }
          }

          await ctx?.prisma.notice.delete({
            where: {
              id: input.noticeId,
            },
            select: {
              _count: true,
              attachments: true,
            },
          });

          response = { isDeleted: true };
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
    }),
  searchNoticeByTitle: publicProcedure
    .input(noticeSearchInput)
    .output(getNoticeListOutput)
    .mutation(async ({ ctx, input }) => {
      let response: GetNoticeListOutput = {
        notices: [],
        totalNotice: 0,
      };
      try {
        // only admin is allowed to invite users
        if (ctx.session?.user.userStatus == "ACTIVE") {
          const searchProcessedString = input.searchText
            .replace(/[^a-zA-Z0-9 ]/g, "") // remove special charachters
            .replace(/ +(?= )/g, "") // remove multiple whitespace
            .trim(); // remove starting and trailing spaces
          //.replaceAll(" ", " | "); // add or
          const dbNoticeSearch = await ctx?.prisma.notice.findMany({
            where: {
              title: {
                contains: searchProcessedString,
                mode: "insensitive",
              },
            },
          });

          const metaNoticeData: NoticeMetadata[] = dbNoticeSearch?.map(
            (notice) => {
              return {
                admin: notice.adminEmailFk,
                id: notice.id,
                tags: notice.tags,
                title: notice.title,
                updatedAt: notice.updatedAt.toDateString(),
              };
            }
          )!;
          response = {
            notices: metaNoticeData,
            totalNotice: dbNoticeSearch?.length || 0,
          };
          return response;
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message: "only active users are allowed to make the request",
          });
        }
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          handlePrismaError(e);
        }
        console.log(e);
      }
      return response;
    }),
});
