import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import * as trpc from "@trpc/server";

export function prismaError(e: PrismaClientKnownRequestError) {
  if (e.code == "P2002") {
    // unique constraint error
    throw new trpc.TRPCError({
      code: "CONFLICT",
      message: "notice already exist",
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
