import type { VoidAuthConfig } from "void/auth";

import type { AuthConfig } from "../queries/auth";

type AuthOptions = Exclude<VoidAuthConfig, (...args: never[]) => unknown>;
type AuthPlugin = NonNullable<AuthOptions["plugins"]>[number];

export const authConfigPlugin = {
  id: "config",
  onRequest: async (request, ctx) => {
    const { options } = ctx;
    const path = `${options.basePath ?? "/api/auth"}/config`;
    if (request.method !== "GET" || new URL(request.url).pathname !== path) return undefined;

    const { emailAndPassword, emailVerification, user } = options;

    const config: AuthConfig = {
      appName: ctx.appName,
      emailAndPassword: {
        enabled: emailAndPassword?.enabled ?? false,
        signUp: !emailAndPassword?.disableSignUp,
        requireEmailVerification: emailAndPassword?.requireEmailVerification ?? false,
        autoSignIn: emailAndPassword?.autoSignIn ?? true,
        resetPassword: typeof emailAndPassword?.sendResetPassword === "function",
        minPasswordLength: ctx.password.config.minPasswordLength,
        maxPasswordLength: ctx.password.config.maxPasswordLength,
      },
      emailVerification: {
        enabled: typeof emailVerification?.sendVerificationEmail === "function",
        sendOnSignUp: emailVerification?.sendOnSignUp ?? false,
        sendOnSignIn: emailVerification?.sendOnSignIn ?? false,
        autoSignInAfterVerification: emailVerification?.autoSignInAfterVerification ?? false,
      },
      socialProviders: ctx.socialProviders.map((provider) => provider.id),
      user: {
        changeEmail: user?.changeEmail?.enabled ?? false,
        deleteUser: user?.deleteUser?.enabled ?? false,
      },
    };

    return { response: Response.json(config) };
  },
} satisfies AuthPlugin;
