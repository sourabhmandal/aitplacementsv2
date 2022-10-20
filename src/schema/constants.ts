import { z } from "zod";

export const ACCEPTED_USER_STATUS = z.enum(["INACTIVE", "ACTIVE", "INVITED"]);
export type USER_STATUS = z.infer<typeof ACCEPTED_USER_STATUS>;

export const ACCEPTED_YEAR = z.enum(["3", "4"]);
export type YEAR = z.infer<typeof ACCEPTED_YEAR>;

export const ACCEPTED_BRANCHES = z.enum([
  "COMP",
  "ENTC",
  "IT",
  "MECH",
  "MECH-ME",
]);
export type BRANCHES = z.infer<typeof ACCEPTED_BRANCHES>;

export const ACCEPTED_ROLES = z.enum(["ADMIN", "STUDENT", "SUPER_ADMIN"]);
export type ROLES = z.infer<typeof ACCEPTED_ROLES>;
