import { getAuthenticatorName, passkey } from "@better-auth/passkey";
import { emailOTP, lastLoginMethod, magicLink, twoFactor, username } from "better-auth/plugins";
import { defineAuth } from "void/auth";
import { sendEmail } from "void/email";

import { DEFAULT_APP_NAME } from "./src/lib/app.ts";
import { authConfigPlugin } from "./src/lib/auth/auth-config-plugin.ts";

const signUpEnabled = true;

const greeting = (name: string) => (name ? `Hi ${name},` : "Hi,");

export default defineAuth(({ defaults, env }) => {
  const appName = (env.APP_NAME as string | undefined) ?? DEFAULT_APP_NAME;

  return {
    ...defaults,
    appName,
    emailAndPassword: {
      enabled: true,
      disableSignUp: !signUpEnabled,
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
          text: `${greeting(user.name)}\n\nReset your password using this link:\n${url}\n\nIf you didn't request this, you can ignore this email.`,
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
          text: `${greeting(user.name)}\n\nConfirm your email address using this link:\n${url}\n\nIf you didn't create an account, you can ignore this email.`,
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
            text: `${greeting(user.name)}\n\nConfirm that you want to permanently delete your account using this link:\n${url}\n\nIf you didn't request this, you can ignore this email.`,
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
      magicLink({
        expiresIn: 60 * 5,
        disableSignUp: !signUpEnabled,
        sendMagicLink: async ({ email, url }) => {
          const result = await sendEmail({
            to: email,
            subject: "Your sign-in link",
            text: `Sign in using this link:\n${url}\n\nIt expires in 5 minutes. If you didn't request this, you can ignore this email.`,
          });
          if (!result.ok) console.error("Failed to send magic link email", result);
        },
      }),
      emailOTP({
        otpLength: 6,
        expiresIn: 60 * 5,
        allowedAttempts: 3,
        disableSignUp: !signUpEnabled,
        sendVerificationOTP: async ({ email, otp, type }) => {
          const purpose = {
            "sign-in": "sign in",
            "email-verification": "verify your email",
            "forget-password": "reset your password",
            "change-email": "change your email",
          }[type];
          const result = await sendEmail({
            to: email,
            subject: `Your verification code: ${otp}`,
            text: `Use this code to ${purpose}:\n\n${otp}\n\nIt expires in 5 minutes. If you didn't request this, you can ignore this email.`,
          });
          if (!result.ok) console.error("Failed to send verification code email", result);
        },
      }),
      twoFactor({
        issuer: appName,
        allowPasswordless: false,
        skipVerificationOnEnable: false,
        twoFactorCookieMaxAge: 60 * 10,
        trustDeviceMaxAge: 60 * 60 * 24 * 30,
        totpOptions: {
          digits: 6,
          period: 30,
        },
        otpOptions: {
          digits: 6,
          period: 5,
          allowedAttempts: 5,
          storeOTP: "encrypted",
          sendOTP: async ({ user, otp }) => {
            const result = await sendEmail({
              to: user.email,
              subject: `Your sign-in code: ${otp}`,
              text: `${greeting(user.name)}\n\nUse this code to finish signing in:\n\n${otp}\n\nIt expires in 5 minutes. If you didn't try to sign in, change your password.`,
            });
            if (!result.ok) console.error("Failed to send two-factor code email", result);
          },
        },
        backupCodeOptions: {
          amount: 10,
          length: 10,
          storeBackupCodes: "encrypted",
        },
        accountLockout: {
          enabled: true,
          maxFailedAttempts: 10,
          durationSeconds: 60 * 15,
        },
      }),
      passkey({
        rpName: appName,
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
        registration: {
          requireSession: true,
          afterVerification: ({ verification }) => ({
            name: getAuthenticatorName(verification.registrationInfo?.aaguid) ?? "Passkey",
          }),
        },
      }),
      lastLoginMethod({
        cookieName: "last_login_method",
        maxAge: 60 * 60 * 24 * 365,
        storeInDatabase: false,
        customResolveMethod: (ctx) =>
          ctx.path === "/sign-in/username" || ctx.path.startsWith("/two-factor/verify")
            ? "email"
            : null,
      }),
      authConfigPlugin(),
    ],
  };
});
