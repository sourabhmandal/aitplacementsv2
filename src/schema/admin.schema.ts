import z from "zod";

export const inviteAdminInput = z.object({
  email: z.string().email(),
});

export const inviteAdminOutput = z.object({
  email: z.string().email(),
});

export const adminListInput = z.object({});
export const adminListOutput = z.array(
  z.object({
    email: z.string().email(),
    name: z.string(),
    emailVerified: z.boolean(),
    role: z.enum(["ADMIN", "STUDENT", "SUPER_ADMIN"]),
    designation: z.string(),
    phoneNo: z.string(),
  })
);
export type AdminListInput = z.TypeOf<typeof adminListOutput>;
