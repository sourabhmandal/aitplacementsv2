import z from "zod";
import { ROLES_ENUM } from "./constants";

export const inviteUserInput = z.object({
  email: z.string().email(),
  role: ROLES_ENUM,
});
export type InviteUserInput = z.TypeOf<typeof inviteUserInput>;

export const inviteUserOutput = z.object({
  email: z.string().email(),
  role: ROLES_ENUM,
});
export type InviteUserOutput = z.TypeOf<typeof inviteUserOutput>;

export const adminListOutput = z.array(
  z.object({
    id: z.string().uuid(),
    basicDetails: z.object({
      role: ROLES_ENUM,
      email: z.string().email(),
    }),
  })
);
export type AdminListOutput = z.TypeOf<typeof adminListOutput>;
