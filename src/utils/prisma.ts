import { PrismaClient } from "@prisma/client";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import { handlePrismaError } from "./prisma.errors";

declare global {
  var prisma: PrismaClient;
}
export let prisma: PrismaClient;

(() => {
  try {
    prisma = global.prisma || new PrismaClient();
    global.prisma = prisma;
  } catch (e) {
    if (
      e instanceof PrismaClientKnownRequestError ||
      e instanceof PrismaClientUnknownRequestError ||
      e instanceof PrismaClientValidationError ||
      e instanceof PrismaClientRustPanicError ||
      e instanceof PrismaClientInitializationError
    )
      handlePrismaError(e);
  }
})();
