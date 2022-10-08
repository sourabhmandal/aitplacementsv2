import { Student, VerificationToken } from "@prisma/client";
import {
  verifyEmailInputSchema,
  verifyEmailOutputSchema,
} from "../../../../schema/verify.schema";
import { createRouter } from "../createRouter";

export const verifyRouter = createRouter().mutation("verify-email", {
  input: verifyEmailInputSchema,
  output: verifyEmailOutputSchema,
  async resolve({ ctx, input }) {
    const dbVerify: VerificationToken | null =
      await ctx.prisma?.verificationToken.findUnique({
        where: {
          identifier: input.hash,
        },
      });

    if (dbVerify && dbVerify.email) {
      const dbUpdatedUser: Student | null = await ctx.prisma?.student.update({
        data: {
          emailVerified: true,
        },
        where: {
          email: dbVerify.email,
        },
      });

      if (dbUpdatedUser.id) {
        // clear admin invite
        await ctx.prisma.verificationToken.deleteMany({
          where: {
            email: dbUpdatedUser.email,
          },
        });
      }

      return {
        email: dbUpdatedUser.email,
        name: dbUpdatedUser.name,
        isVerified: dbUpdatedUser.emailVerified,
      };
    }

    return {
      email: "",
      name: "",
      isVerified: false,
    };
  },
});
