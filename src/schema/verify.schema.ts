import z from "zod";

export const verifyEmailInputSchema = z.object({
  hash: z.string(),
});
export const verifyEmailOutputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  isVerified: z.boolean(),
});

export type VerifyEmailInput = z.TypeOf<typeof verifyEmailInputSchema>;
export type VerifyEmailOutput = z.TypeOf<typeof verifyEmailOutputSchema>;
