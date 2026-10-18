import * as z from "zod";

export const emailSchema = z.email("Enter a valid email address.");

export interface PasswordRules {
  minPasswordLength: number;
  maxPasswordLength: number;
}

const createPasswordSchema = ({ minPasswordLength, maxPasswordLength }: PasswordRules) =>
  z
    .string()
    .min(minPasswordLength, `Password must be at least ${minPasswordLength} characters.`)
    .max(maxPasswordLength, `Password must be at most ${maxPasswordLength} characters.`);

const confirmPassword = {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
};

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const createSignUpSchema = (rules: PasswordRules) =>
  z
    .object({
      email: emailSchema,
      password: createPasswordSchema(rules),
      confirmPassword: z.string(),
    })
    .refine((v) => v.password === v.confirmPassword, confirmPassword);

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const createResetPasswordSchema = (rules: PasswordRules) =>
  z
    .object({
      password: createPasswordSchema(rules),
      confirmPassword: z.string(),
    })
    .refine((v) => v.password === v.confirmPassword, confirmPassword);
