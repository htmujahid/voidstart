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
        const magicLinkOptions = pluginOptions<{ expiresIn?: number }>("magic-link");
        const emailOtpOptions = pluginOptions<{ otpLength?: number; expiresIn?: number }>(
          "email-otp",
        );
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
          magicLink: {
            enabled: !!magicLinkOptions,
            expiresIn: magicLinkOptions?.expiresIn ?? 60 * 5,
          },
          emailOtp: {
            enabled: !!emailOtpOptions,
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
