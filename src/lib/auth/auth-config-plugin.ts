import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";

export const authConfigPlugin = () =>
  ({
    id: "config",
    endpoints: {
      getConfig: createAuthEndpoint("/config", { method: "GET" }, async (ctx) => {
        const { options, appName, password, socialProviders } = ctx.context;
        const pluginOptions = <T>(id: string) =>
          options.plugins?.find((p) => p.id === id)?.options as T | undefined;
        const usernameOptions = pluginOptions<{
          minUsernameLength?: number;
          maxUsernameLength?: number;
        }>("username");
        const twoFactorOptions = pluginOptions<{
          issuer?: string;
          allowPasswordless?: boolean;
          skipVerificationOnEnable?: boolean;
          twoFactorCookieMaxAge?: number;
          trustDeviceMaxAge?: number;
          totpOptions?: { digits?: 6 | 8; period?: number; disable?: boolean };
          otpOptions?: { digits?: number; period?: number; sendOTP?: unknown };
          backupCodeOptions?: { amount?: number; length?: number };
        }>("two-factor");
        const passkeyOptions = pluginOptions<{
          rpName?: string;
          authenticatorSelection?: {
            authenticatorAttachment?: "platform" | "cross-platform";
            residentKey?: string;
            userVerification?: string;
          };
          registration?: { requireSession?: boolean };
        }>("passkey");
        const magicLinkOptions = pluginOptions<{ expiresIn?: number; disableSignUp?: boolean }>(
          "magic-link",
        );
        const emailOtpOptions = pluginOptions<{
          otpLength?: number;
          expiresIn?: number;
          disableSignUp?: boolean;
        }>("email-otp");
        const { emailAndPassword, emailVerification, user, account } = options;

        return ctx.json({
          appName,
          emailAndPassword: {
            enabled: emailAndPassword?.enabled ?? false,
            signUp: !emailAndPassword?.disableSignUp,
            requireEmailVerification: emailAndPassword?.requireEmailVerification ?? false,
            autoSignIn: emailAndPassword?.autoSignIn ?? true,
            resetPassword: typeof emailAndPassword?.sendResetPassword === "function",
            resetPasswordTokenExpiresIn: emailAndPassword?.resetPasswordTokenExpiresIn ?? 60 * 60,
            minPasswordLength: password.config.minPasswordLength,
            maxPasswordLength: password.config.maxPasswordLength,
          },
          emailVerification: {
            enabled: typeof emailVerification?.sendVerificationEmail === "function",
            sendOnSignUp: emailVerification?.sendOnSignUp ?? false,
            sendOnSignIn: emailVerification?.sendOnSignIn ?? false,
            autoSignInAfterVerification: emailVerification?.autoSignInAfterVerification ?? false,
            expiresIn: emailVerification?.expiresIn ?? 60 * 60,
          },
          socialProviders: socialProviders.map((provider) => provider.id),
          account: {
            linking: account?.accountLinking?.enabled ?? true,
            allowUnlinkingAll: account?.accountLinking?.allowUnlinkingAll ?? false,
          },
          twoFactor: {
            enabled: !!twoFactorOptions,
            allowPasswordless: twoFactorOptions?.allowPasswordless ?? false,
            skipVerificationOnEnable: twoFactorOptions?.skipVerificationOnEnable ?? false,
            verificationExpiresIn: twoFactorOptions?.twoFactorCookieMaxAge ?? 60 * 10,
            trustDeviceMaxAge: twoFactorOptions?.trustDeviceMaxAge ?? 60 * 60 * 24 * 30,
            totp: {
              enabled: !!twoFactorOptions && !twoFactorOptions.totpOptions?.disable,
              digits: twoFactorOptions?.totpOptions?.digits ?? 6,
              period: twoFactorOptions?.totpOptions?.period ?? 30,
            },
            otp: {
              enabled: typeof twoFactorOptions?.otpOptions?.sendOTP === "function",
              digits: twoFactorOptions?.otpOptions?.digits ?? 6,
              expiresIn: (twoFactorOptions?.otpOptions?.period ?? 3) * 60,
            },
            backupCodes: {
              amount: twoFactorOptions?.backupCodeOptions?.amount ?? 10,
              length: twoFactorOptions?.backupCodeOptions?.length ?? 10,
            },
          },
          passkey: {
            enabled: !!passkeyOptions,
            rpName: passkeyOptions?.rpName ?? appName,
            authenticatorAttachment:
              passkeyOptions?.authenticatorSelection?.authenticatorAttachment ?? null,
            userVerification: passkeyOptions?.authenticatorSelection?.userVerification ?? null,
          },
          magicLink: {
            enabled: !!magicLinkOptions,
            signUp: !magicLinkOptions?.disableSignUp,
            expiresIn: magicLinkOptions?.expiresIn ?? 60 * 5,
          },
          emailOtp: {
            enabled: !!emailOtpOptions,
            signUp: !emailOtpOptions?.disableSignUp,
            otpLength: emailOtpOptions?.otpLength ?? 6,
            expiresIn: emailOtpOptions?.expiresIn ?? 60 * 5,
          },
          username: {
            enabled: !!usernameOptions,
            minUsernameLength: usernameOptions?.minUsernameLength ?? 3,
            maxUsernameLength: usernameOptions?.maxUsernameLength ?? 30,
          },
          user: {
            changeEmail: user?.changeEmail?.enabled ?? false,
            deleteUser: user?.deleteUser?.enabled ?? false,
            deleteUserVerification:
              typeof user?.deleteUser?.sendDeleteAccountVerification === "function",
          },
        });
      }),
    },
  }) satisfies BetterAuthPlugin;
