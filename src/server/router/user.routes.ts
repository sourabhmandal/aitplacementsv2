import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { inviteUserInput, inviteUserOutput } from "../../schema/admin.schema";
import { ROLES, USER_STATUS, YEAR } from "../../schema/constants";
import {
  OnboardUserOutput,
  updateUserInput,
  UpdateUserOutput,
  updateUserOutput,
  userDeleteInput,
  userDeleteOutput,
  UserDeleteOutput,
  userDetailsOutput,
  UserDetailsOutput,
  userListInput,
  UserListOutput,
  userListOutput,
  userRoleInput,
  userRoleOutput,
  UserRoleOutput,
  userSearchInput,
} from "../../schema/user.schema";
import { handlePrismaError } from "../../utils/prisma.errors";
import { NodemailerInstance } from "../nodemailer_instance";
import { publicProcedure, router } from "../trpc";

export const userRouter = router({
  onboardUser: publicProcedure
    .input(updateUserInput)
    .output(updateUserOutput)
    .mutation(async ({ input, ctx }) => {
      let response: OnboardUserOutput = {
        email: "",
        name: "",
        role: "STUDENT",
      };

      try {
        if (ctx.session?.user.userStatus !== "INACTIVE") {
          const updatedDBUser = await ctx?.prisma.user.update({
            where: {
              email: ctx.session?.user.email!,
            },
            data: {
              name: input.name,
              phoneNo: input.phoneNo?.toString(),
              userStatus: "ACTIVE",
            },
          })!;

          response = {
            email: updatedDBUser.email,
            name: updatedDBUser.name!,
            role: updatedDBUser.role,
          };
          if (updatedDBUser?.role == "ADMIN") {
            await ctx?.prisma.adminDetails.upsert({
              where: {
                basicDetailsFk: updatedDBUser.id,
              },
              update: {},
              create: {
                basicDetails: {
                  connect: {
                    email: ctx.session?.user.email,
                  },
                },
              },
            });
          } else if (updatedDBUser?.role == "STUDENT") {
            await ctx?.prisma.studentDetails.upsert({
              where: {
                basicDetailsFk: updatedDBUser.id,
              },
              update: {
                branch: input.branch,
                registrationNumber: input.regNo,
                year: parseInt(input.year || "0"),
              },
              create: {
                basicDetails: {
                  connect: {
                    email: ctx.session?.user.email,
                  },
                },
                branch: input.branch,
                registrationNumber: input.regNo,
                year: parseInt(input.year || "0"),
              },
            });
          }
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message: "inactive users are not allowed to make the request",
          });
        }
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError)
          handlePrismaError(err);
        else console.log(err);
      }

      return response;
    }),
  inviteUser: publicProcedure
    .input(inviteUserInput)
    .output(inviteUserOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          if (!input.email.endsWith("@aitpune.edu.in")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              cause: "invalid email id",
              message:
                "only user with email having @aitpune.edu.in can be invited",
            });
          }
          const user = await ctx?.prisma.user.create({
            data: {
              email: input.email,
              role: input.role,
              userStatus: "INVITED",
            },
            select: {
              email: true,
              role: true,
            },
          });
          if (user) {
            // nodemailer
            await NodemailerInstance.GetNodemailer();
            await NodemailerInstance.SendUserInviteEmail(
              input.email,
              input.role
            );
            return {
              email: user.email,
              role: user.role as ROLES,
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
        if (e instanceof PrismaClientKnownRequestError) handlePrismaError(e);
        else console.log(e);
      }
      // return fail response
      return {
        email: "",
        role: "STUDENT" as ROLES,
      };
    }),
  getUserList: publicProcedure
    .input(userListInput)
    .output(userListOutput)
    .query(async ({ ctx, input }) => {
      let response: UserListOutput = {
        users: [
          {
            email: "",
            id: "",
            name: "",
            role: "STUDENT",
            userStatus: "INACTIVE",
          },
        ],
        count: 0,
      };
      try {
        if (ctx.session?.user.userStatus == "ACTIVE") {
          const userListLen: number = await ctx?.prisma.user.count({
            where: {
              role: input.role as ROLES,
            },
          })!;
          const dbStudent = await ctx?.prisma.user.findMany({
            where: {
              role: input.role as ROLES,
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              userStatus: true,
              _count: true,
            },
            skip: (input.pageNos - 1) * 10,
            take: 10,
          });

          response.users = dbStudent?.map((item) => ({
            id: item.id,
            email: item.email,
            name: item.name || "N.A",
            role: item.role as ROLES,
            userStatus: item.userStatus as USER_STATUS,
          }))!;
          response.count = userListLen;
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message: "only active users are allowed to make the request",
          });
        }
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError)
          handlePrismaError(err);
        else console.log(err);
      }
      return response;
    }),
  getUserProfileDetails: publicProcedure
    .output(userDetailsOutput)
    .query(async ({ ctx }) => {
      let response: UserDetailsOutput = {
        email: "",
        name: "",
        phoneNo: "",
        role: "STUDENT",
        userStatus: "INACTIVE",
      };
      try {
        if (ctx.session?.user.userStatus == "ACTIVE") {
          const dbUser = await ctx?.prisma.user.findFirst({
            where: {
              email: ctx.session.user.email,
            },
            select: {
              email: true,
              name: true,
              role: true,
              phoneNo: true,
              userStatus: true,
              StudentDetails: {
                select: {
                  branch: true,
                  registrationNumber: true,
                  year: true,
                },
              },
            },
          });
          response = {
            email: dbUser?.email!,
            name: dbUser?.name || "N.A",
            role: dbUser?.role as ROLES,
            phoneNo: dbUser?.phoneNo || "N.A",
            userStatus: dbUser?.userStatus as USER_STATUS,
          };
          if (dbUser?.StudentDetails) {
            response.studentDetails = {
              branch: dbUser.StudentDetails.branch!,
              registrationNumber: dbUser.StudentDetails.registrationNumber,
              year: dbUser.StudentDetails.year?.toString() as YEAR,
            };
          }
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message: "only active users are allowed to make the request",
          });
        }
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError)
          handlePrismaError(err);
        else console.log(err);
      }
      return response;
    }),
  changeUserRole: publicProcedure
    .input(userRoleInput)
    .output(userRoleOutput)
    .mutation(async ({ ctx, input }) => {
      let response: UserRoleOutput = {
        email: "",
        role: "STUDENT",
      };
      try {
        // only admin is allowed to invite users
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          const dbUser = await ctx?.prisma.user.update({
            where: {
              id: input.id,
            },
            data: {
              role: input.role,
            },
          })!;

          response = {
            email: dbUser.email,
            role: dbUser.role,
          };
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message:
              "only admins and super admins are allowed to make the request",
          });
        }
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError)
          handlePrismaError(err);
        else console.log(err);
      }
      return response;
    }),
  deleteUser: publicProcedure
    .input(userDeleteInput)
    .output(userDeleteOutput)
    .mutation(async ({ ctx, input }) => {
      let response: UserDeleteOutput = {
        email: "",
      };

      try {
        // only admin is allowed to invite users
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          const dbUser = await ctx?.prisma.user.delete({
            where: {
              id: input.id,
            },
          })!;

          return {
            email: dbUser.email,
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
  updateUserProfile: publicProcedure
    .input(updateUserInput)
    .output(updateUserOutput)
    .mutation(async ({ ctx, input }) => {
      let response: UpdateUserOutput = {
        name: "",
        role: "STUDENT",
        email: "",
      };

      try {
        // only admin is allowed to invite users
        if (
          (ctx.session?.user.role == "ADMIN" ||
            ctx.session?.user.role == "SUPER_ADMIN") &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          await ctx?.prisma.user.update({
            where: {
              email: ctx.session.user.email,
            },
            data: {
              name: input.name,
              phoneNo: input.phoneNo,
            },
          });
          response.email = ctx.session.user.email;
          response.role = ctx.session.user.role;
          response.name = input.name;
          return response;
        } else if (
          ctx.session?.user.role == "STUDENT" &&
          ctx.session?.user.userStatus == "ACTIVE"
        ) {
          await ctx?.prisma.user.update({
            where: {
              email: ctx.session.user.email,
            },
            data: {
              name: input.name,
              phoneNo: input.phoneNo,
              StudentDetails: {
                update: {
                  branch: input.branch,
                  registrationNumber: input.regNo,
                  year: parseInt(input.year!),
                },
              },
            },
          });
          response.email = ctx.session.user.email;
          response.role = ctx.session.user.role;
          response.name = input.name;
          return response;
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
  searchUserByEmail: publicProcedure
    .input(userSearchInput)
    .output(userListOutput)
    .mutation(async ({ ctx, input }) => {
      let response: UserListOutput = { users: [], count: 0 };
      try {
        // only admin is allowed to invite users
        if (ctx.session?.user.userStatus == "ACTIVE") {
          const searchProcessedString = input.searchText
            .replace(/[^a-zA-Z0-9 ]/g, "") // remove special charachters
            .replaceAll(/\s/g, "") // remove multiple whitespace
            .trim(); // remove starting and trailing spaces
          //.replaceAll(" ", " | "); // add or

          const dbUserSearch = await ctx?.prisma.user.findMany({
            where: {
              email: {
                contains: searchProcessedString,
                mode: "insensitive",
              },
            },
          });

          response.users = dbUserSearch?.map((user) => {
            return {
              email: user.email,
              id: user.id,
              name: user.name || "N.A",
              phoneNo: user.phoneNo || "N.A",
              role: user.role,
              userStatus: user.userStatus,
            };
          })!;
          response.count = dbUserSearch?.length!;
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            cause: "Improper authorization",
            message: "only active accounts allowed to make the request",
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
