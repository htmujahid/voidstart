import * as z from "zod";

import { createPasswordSchema, emailSchema } from "@/components/auth/schemas";
import type { PasswordRules } from "@/components/auth/schemas";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100, "Name is too long."),
});

export const changeEmailSchema = z.object({ newEmail: emailSchema });

export const createChangePasswordSchema = (rules: PasswordRules) =>
  z
    .object({
      currentPassword: z.string().min(1, "Current password is required."),
      newPassword: createPasswordSchema(rules),
      confirmPassword: z.string(),
      revokeOtherSessions: z.boolean(),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    })
    .refine((v) => v.newPassword !== v.currentPassword, {
      path: ["newPassword"],
      message: "New password must be different from the current one.",
    });

export const deleteAccountSchema = z.object({ password: z.string() });
