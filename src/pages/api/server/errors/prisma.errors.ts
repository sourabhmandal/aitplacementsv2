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
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "entry already exist",
        });

      // Prisma Client Error (Query Engine)
      case "P2000":
        throw new trpc.TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "entry reached beyond column limit",
        });
      case "P2001":
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "entry doesnt exist",
        });
      case "P2002":
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "entry already exist",
        });

      case "P2003":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "connecting entry not for", // foreign key conflict
        });
      case "P2004":
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "database error occured",
        });
      case "P2005":
        throw new trpc.TRPCError({
          code: "PARSE_ERROR",
          message: "invalid data type passed",
        });
      case "P2006":
        throw new trpc.TRPCError({
          code: "PARSE_ERROR",
          message: "some values are invalid in provided data",
        });
      case "P2007":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "data validation error",
        });
      case "P2008":
        throw new trpc.TRPCError({
          code: "PARSE_ERROR",
          message: "failed to parse the query",
        });

      case "P2009":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "failed to validate the query",
        });
      case "P2010":
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "raw query failed",
        });
      case "P2011":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "constraint violation on db",
        });
      case "P2012":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "missing a required value",
        });
      case "P2013":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "missing the required argument",
        });
      case "P2014":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "violation in the required relation",
        });
      case "P2015":
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "related record could not be found",
        });
      case "P2016":
        throw new trpc.TRPCError({
          code: "PARSE_ERROR",
          message: "query interpretation error",
        });
      case "P2017":
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "records for relation not connected",
        });
      case "P2018":
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "required connected records were not found",
        });
      case "P2019":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "input error",
        });
      case "P2020":
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "value out of range for the type",
        });
      case "P2021":
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "table does not exist in the current database",
        });
      case "P2022":
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "column does not exist in the current database",
        });
      case "P2023":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "inconsistent column data",
        });
      case "P2024":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message:
            "timed out fetching a new connection from the connection pool",
        });

      case "P2025":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message:
            "timed out fetching a new connection from the connection pool",
        });
      case "P2026":
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "database support for features used in query not supported",
        });
      case "P2027":
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message:
            "multiple errors occurred on the database during query execution",
        });
      case "P2028":
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "transaction API error",
        });
      case "P2030":
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "cannot find a fulltext index to use for the search",
        });

      case "P2033":
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "number value too large for database",
        });
      case "P2034":
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "transaction failed due to a write conflict or a deadlock",
        });
      case "P3000":
        throw error("failed to create database");
      case "P3001":
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "cannot find a fulltext index to use for the search",
        });
      case "P3002":
        throw error("attempted migration was rolled back");
      case "P3003":
        throw error(
          "the format of migrations changed, the saved migrations are no longer valid"
        );
      case "P3004":
        throw error("database is a system database");
      case "P3005":
        throw error("database schema is not empty");
      case "P3006":
        throw error("failed to apply cleanly to the shadow database");

      case "P3007":
        throw error(
          "the requested preview features are not yet allowed in migration engine"
        );
      case "P3008":
        throw error("migration is already recorded as applied in the database");
      case "P3009":
        throw error(
          "migrate found failed migrations in the target database, new migrations will not be applied"
        );
      case "P3010":
        throw error(
          "The name of the migration is too long. It must not be longer than 200 characters (bytes)."
        );
      case "P3011":
        throw error(
          "migration cannot be rolled back because it was never applied to the database"
        );
      case "P3012":
        throw error(
          "cannot be rolled back because it is not in a failed state"
        );
      case "P3013":
        throw error(
          "datasource provider arrays are no longer supported in migrate"
        );
      case "P3014":
        throw error("prisma Migrate could not create the shadow database");
      case "P3015":
        throw error("Could not find the migration file");
      case "P5000":
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "this request could not be understood by the server",
        });
      case "P5001":
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "this request must be retried",
        });
      case "P5002":
        throw error("could not parse the URL of the datasource");
      default:
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "unhandled error occured at database",
        });
    }
  } else {
    console.log(
      `Prisma error(${e.name}) occured :: message: ${e.message}, cause: ${e.cause}`
    );
  }
  console.log(e.stack);
}
