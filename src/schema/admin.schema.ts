import z from "zod";
import { ACCEPTED_ROLES } from "./constants";

export const inviteUserInput = z.object({
  email: z.string().email(),
  role: ACCEPTED_ROLES,
});
export type InviteUserInput = z.TypeOf<typeof inviteUserInput>;

export const inviteUserOutput = z.object({
  email: z.string().email(),
  role: ACCEPTED_ROLES,
});
export type InviteUserOutput = z.TypeOf<typeof inviteUserOutput>;

export const adminListOutput = z.array(
  z.object({
    id: z.string().uuid(),
    basicDetails: z.object({
      role: ACCEPTED_ROLES,
      email: z.string().email(),
    }),
  })
);
export type AdminListOutput = z.TypeOf<typeof adminListOutput>;
