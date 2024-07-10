import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username should be atleast 2 characters long")
  .max(20, "Username should not be more 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username should not contain special characters");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters long" }),
});
