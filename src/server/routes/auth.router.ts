import { User } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import * as trpc from "@trpc/server";
import {
  createUserOutputSchema,
  createUserSchema,
} from "../../schema/user.schema";
import { createRouter } from "../createRouter";

export const authRouter = createRouter().mutation("register-user", {
  input: createUserSchema,
  output: createUserOutputSchema,
  async resolve({ ctx, input }) {
    const { name, regno, year, branch, email, password } = input;
    try {
      const dbResp: User = await ctx.prisma.user.create({
        data: {
          name: name,
          email: email,
          branch: branch,
          registrationNumber: regno,
          year: year,
          password: password,
          emailVerified: false,
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
});
