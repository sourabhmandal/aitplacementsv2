import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import {
  inviteUserInput,
  inviteUserOutput,
} from "../../../../schema/admin.schema";
import { ROLES, USER_STATUS } from "../../../../schema/constants";
import {
  updateUserInput,
  UpdateUserOutput,
  updateUserOutput,
  userDeleteInput,
  userDeleteOutput,
  userDetailsInput,
  UserDetailsOutput,
  userDetailsOutput,
  userListInput,
  UserListOutput,
  userListOutput,
  userRoleInput,
  userRoleOutput,
} from "../../../../schema/user.schema";
import { createRouter } from "../createRouter";
import { prismaError } from "../errors/prisma.errors";
import { NodemailerInstance } from "../nodemailer_instance";

export const userRouter = createRouter()
  .mutation("onboard-user", {
    input: updateUserInput,
    output: updateUserOutput,
    async resolve({ ctx, input }) {
      let response: UpdateUserOutput = {
        email: "",
        name: "",
        role: "STUDENT",
      };

      const updatedDBUser = await ctx?.prisma.user.update({
        where: {
          email: input.email,
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
                email: input.email,
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
                email: input.email,
              },
            },
            branch: input.branch,
            registrationNumber: input.regNo,
            year: parseInt(input.year || "0"),
          },
        });
      }

      return response;
    },
  })
  .mutation("invite-user", {
    input: inviteUserInput,
    output: inviteUserOutput,
    async resolve({ ctx, input }) {
      try {
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
          await NodemailerInstance.SendUserInviteEmail(input.email, input.role);
          return {
            email: user.email,
            role: user.role as ROLES,
          };
        }
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) prismaError(e);
        else console.log(e);
      }

      // return fail response
      return {
        email: "",
        role: "STUDENT" as ROLES,
      };
    },
  })
  .query("get-user-list", {
    input: userListInput,
    output: userListOutput,
    async resolve({ ctx, input }) {
      const dbStudent = await ctx?.prisma.user.findMany({
        where: {
          role: input.role as ROLES,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phoneNo: true,
          userStatus: true,
        },
      });

      const data: UserListOutput = dbStudent?.map((item) => ({
        id: item.id,
        email: item.email,
        name: item.name || "N.A",
        role: item.role as ROLES,
        phoneNo: item.phoneNo || "N.A",
        userStatus: item.userStatus as USER_STATUS,
      }))!;
      return data;
    },
  })
  .query("get-user-details", {
    input: userDetailsInput,
    output: userDetailsOutput,
    async resolve({ ctx, input }) {
      const dbUser = await ctx?.prisma.user.findFirst({
        where: {
          email: input.email,
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
      const data: UserDetailsOutput = {
        email: dbUser?.email!,
        name: dbUser?.name || "N.A",
        role: dbUser?.role as ROLES,
        phoneNo: dbUser?.phoneNo || "N.A",
        userStatus: dbUser?.userStatus as USER_STATUS,
      };
      if (dbUser?.StudentDetails) {
        data.studentDetails = {
          branch: dbUser.StudentDetails.branch!,
          registrationNumber: dbUser.StudentDetails.registrationNumber,
          year: dbUser.StudentDetails.year!,
        };
      }
      return data;
    },
  })
  .mutation("change-user-role", {
    input: userRoleInput,
    output: userRoleOutput,
    async resolve({ ctx, input }) {
      const dbUser = await ctx?.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          role: input.role,
        },
      })!;

      return {
        email: dbUser.email,
        role: dbUser.role,
      };
    },
  })
  .mutation("delete-user", {
    input: userDeleteInput,
    output: userDeleteOutput,
    async resolve({ ctx, input }) {
      try {
        const dbUser = await ctx?.prisma.user.delete({
          where: {
            id: input.id,
          },
        })!;

        return {
          email: dbUser.email,
        };
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          prismaError(e);
        }
        console.log(e);
      }
      return {
        email: "",
      };
    },
  });
