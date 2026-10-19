import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";

export const authConfigPlugin = () =>
  ({
    id: "config",
    endpoints: {
      getConfig: createAuthEndpoint("/config", { method: "GET" }, async (ctx) => {
        const { options, appName, password, socialProviders } = ctx.context;
        const usernameOptions = options.plugins?.find((p) => p.id === "username")?.options as
          | { minUsernameLength?: number; maxUsernameLength?: number }
          | undefined;
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
