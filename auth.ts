import { username } from "better-auth/plugins";
import { defineAuth } from "void/auth";
import { sendEmail } from "void/email";

import { authConfigPlugin } from "./src/lib/auth/auth-config-plugin.ts";

export default defineAuth(({ defaults }) => ({
  ...defaults,
  appName: "locosheet",
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: false,
    sendResetPassword: async ({ user, url }) => {
      const result = await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Hi ${user.name},\n\nReset your password using this link:\n${url}\n\nIf you didn't request this, you can ignore this email.`,
      });
      if (!result.ok) console.error("Failed to send reset email", result);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      const result = await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Hi ${user.name},\n\nConfirm your email address using this link:\n${url}\n\nIf you didn't create an account, you can ignore this email.`,
      });
      if (!result.ok) console.error("Failed to send verification email", result);
    },
  },
  user: {
    changeEmail: {
      enabled: false,
      updateEmailWithoutVerification: false,
    },
    deleteUser: {
      enabled: true,
      deleteTokenExpiresIn: 60 * 60 * 24,
      sendDeleteAccountVerification: async ({ user, url }) => {
        const result = await sendEmail({
          to: user.email,
          subject: "Confirm account deletion",
          text: `Hi ${user.name},\n\nConfirm that you want to permanently delete your account using this link:\n${url}\n\nIf you didn't request this, you can ignore this email.`,
        });
        if (!result.ok) console.error("Failed to send delete account email", result);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60 * 24,
    disableSessionRefresh: false,
    cookieCache: {
      enabled: false,
      maxAge: 60 * 5,
      strategy: "compact",
    },
  },
  account: {
    updateAccountOnSignIn: true,
    encryptOAuthTokens: false,
    accountLinking: {
      enabled: true,
      disableImplicitLinking: false,
      requireLocalEmailVerified: true,
      allowDifferentEmails: false,
      allowUnlinkingAll: false,
      updateUserInfoOnLink: false,
    },
  },
  onAPIError: {
    throw: false,
    errorURL: "/auth/error",
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
    authConfigPlugin(),
  ],
}));
