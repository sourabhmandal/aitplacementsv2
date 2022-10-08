import { Admin, Student, VerificationToken } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import * as trpc from "@trpc/server";
import { randomUUID } from "crypto";
import {
  createUserInputSchema,
  createUserOutputSchema,
  StudentListOutput,
  studentListOutput,
} from "../../../../schema/user.schema";
import { createRouter } from "../createRouter";
import { NodemailerInstance } from "../nodemailer_instance";

export const userRouter = createRouter()
  .mutation("register-user", {
    input: createUserInputSchema,
    output: createUserOutputSchema,
    async resolve({ ctx, input }) {
      const { name, regno, year, branch, email, password } = input;
      try {
        // look for token in db
        const adminVerifyDBResp: VerificationToken | null =
          await ctx.prisma.verificationToken.findFirst({
            where: {
              email: email,
            },
          });

        if (adminVerifyDBResp && adminVerifyDBResp.role == "ADMIN") {
          // user is admin, create admin entry
          const adminDB: Admin = await ctx.prisma.admin.create({
            data: {
              email: email,
              name: name,
              password: password,
              designation: "",
              emailVerified: true,
              phoneNo: "",
              role: "ADMIN",
            },
          });

          if (adminDB.id) {
            // clear admin invite
            await ctx.prisma.verificationToken.deleteMany({
              where: {
                email: email,
              },
            });
          }

          return {
            email: adminDB.email,
            name: adminDB.name,
          };
        }

        // -------------------------------------------------------------------------

        // register student flow
        const now = new Date();
        const verifyDBResp: VerificationToken =
          await ctx.prisma.verificationToken.create({
            data: {
              email: email,
              expires: new Date(now.getTime() + 30 * 60000),
              identifier: randomUUID(),
            },
          });

        // nodemailer
        await NodemailerInstance.GetNodemailer();
        await NodemailerInstance.SendVerifyEmail(
          verifyDBResp.identifier,
          email
        );

        const dbResp: Student = await ctx.prisma.student.create({
          data: {
            name: name,
            email: email,
            branch: branch,
            registrationNumber: regno,
            year: parseInt(year),
            password: password,
            emailVerified: false,
            phoneNo: "",
          },
        });
        return { email: dbResp.email, name: dbResp.name };
      } catch (e) {
        console.log(e);
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code == "P2002") {
            // unique constraint error
            throw new trpc.TRPCError({
              code: "CONFLICT",
              message: "user already exist",
            });
          }

          if (e instanceof PrismaClientValidationError) {
            throw new trpc.TRPCError({
              code: "BAD_REQUEST",
              message: "Data is invalid",
            });
          }

          throw new trpc.TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "something went wrong",
          });
        }
      }

      // default response
      return {
        name: "",
        email: "",
      };
    },
  })
  .query("get-students", {
    output: studentListOutput,
    async resolve({ ctx, input }) {
      const dbStudent: Student[] = await ctx.prisma.student.findMany();

      const data: StudentListOutput = dbStudent.map((item) => ({
        email: item.email,
        emailVerified: item.emailVerified,
        name: item.name!,
        phoneNo: item.phoneNo!,
        branch: item.branch!,
        registrationNumber: item.registrationNumber,
        year: item.year!,
      }));
      return data;
    },
  });
