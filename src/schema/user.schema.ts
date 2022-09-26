import z from "zod";

export const createUserSchema = z.object({
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
export type CreateUserInput = z.TypeOf<typeof createUserSchema>;
