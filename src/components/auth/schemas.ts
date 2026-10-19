import * as z from "zod";

export const emailSchema = z.email("Enter a valid email address.");

export interface PasswordRules {
  minPasswordLength: number;
  maxPasswordLength: number;
}

export const createPasswordSchema = ({ minPasswordLength, maxPasswordLength }: PasswordRules) =>
  z
    .string()
    .min(minPasswordLength, `Password must be at least ${minPasswordLength} characters.`)
    .max(maxPasswordLength, `Password must be at most ${maxPasswordLength} characters.`);

const confirmPassword = {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
};

export interface UsernameRules {
  minUsernameLength: number;
  maxUsernameLength: number;
}

export const createUsernameSchema = ({ minUsernameLength, maxUsernameLength }: UsernameRules) =>
  z
    .string()
    .trim()
    .min(minUsernameLength, `Username must be at least ${minUsernameLength} characters.`)
    .max(maxUsernameLength, `Username must be at most ${maxUsernameLength} characters.`)
    .regex(/^[a-zA-Z0-9_.]+$/, "Use only letters, numbers, underscores and dots.");

export const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required."),
  password: z.string().min(1, "Password is required."),
});

export const createSignUpSchema = (rules: PasswordRules) =>
  z.object({
    email: emailSchema,
    password: createPasswordSchema(rules),
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const createResetPasswordSchema = (rules: PasswordRules) =>
  z
    .object({
      password: createPasswordSchema(rules),
      confirmPassword: z.string(),
    })
    .refine((v) => v.password === v.confirmPassword, confirmPassword);

export const emailOnlySchema = z.object({ email: emailSchema });
