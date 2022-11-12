import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import * as trpc from "@trpc/server";
import { error } from "console";

export function handlePrismaError(
  e:
    | PrismaClientKnownRequestError
    | PrismaClientUnknownRequestError
    | PrismaClientValidationError
    | PrismaClientRustPanicError
    | PrismaClientInitializationError
) {
  if (e instanceof PrismaClientKnownRequestError) {
    console.log(
      `Prisma error(${e.name}) occured :: code: ${e.code}, message: ${e.message}, cause: ${e.cause}`
    );
    console.log(e.meta);

    switch (e.code) {
      case "P1000":
        throw error(
          `couldnt connected to database, authentication failed: ${e.message}`
        );
      case "P1001":
        throw error(
          `can't reach database server at mentioned host or port: ${e.message}`
        );
      case "P1002":
        throw error(`database server connection timed out: ${e.message}`);
      case "P1003":
        throw error(`database does not exist: ${e.message}`);
      case "P1008":
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "database operation timed out",
        });
      case "P1009":
        throw error(`database already exists: ${e.message}`);
      case "P1010":
        throw error(
          `database user was denied access to connect to database: ${e.message}`
        );
      case "P1011":
        throw error(`error opening a TLS connection: ${e.message}`);
      case "P1012":
        throw error(`schema is invalid ${e.message}`);

      case "P1013":
        throw error(`The provided database string is invalid ${e.message}`);
      case "P1014":
        throw error(`model not found ${e.message}`);
      case "P1015":
        throw error(`${e.message}`);
      case "P1016":
        throw error(`${e.message}`);
      case "P1017":
        throw error(`${e.message}`);
      case "P2002":
        // unique constraint error
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "entry already exist",
        });

      // Prisma Client Error (Query Engine)
      case "P2000":
        // unique constraint error
        throw new trpc.TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "entry reached beyond column limit",
        });
      case "P2001":
        // unique constraint error
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "entry doesnt exist",
        });
      case "P2002":
        // unique constraint error
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "entry already exist",
        });
    }
  } else {
    console.log(
      `Prisma error(${e.name}) occured :: message: ${e.message}, cause: ${e.cause}`
    );
  }
  console.log(e.stack);
}
