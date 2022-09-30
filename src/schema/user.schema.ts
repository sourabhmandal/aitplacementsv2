import z from "zod";

export const createUserInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  regno: z.number(),
  year: z.enum(["3", "4"]),
  branch: z.enum(["COMP", "IT", "ENTC", "MECH", "MECH-ME"]),
  password: z.string(),
});
export const createUserOutputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export type CreateUserInput = z.TypeOf<typeof createUserInputSchema>;

export const studentListOutput = z.array(
  z.object({
    email: z.string().email(),
    name: z.string(),
    emailVerified: z.boolean(),
    phoneNo: z.string(),
    registrationNumber: z.number(),
    year: z.number(),
    branch: z.string(),
  })
);
export type StudentListOutput = z.TypeOf<typeof studentListOutput>;