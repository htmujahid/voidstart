import { useSuspenseQuery } from "@tanstack/react-query";

import { authConfigQueryOptions } from "@/lib/queries/auth";

export function useAuthConfig() {
  const { data } = useSuspenseQuery(authConfigQueryOptions);
  const { emailAndPassword, socialProviders } = data;
  const hasSocial = socialProviders.length > 0;
  const emailSignIn = emailAndPassword.enabled;
  const emailSignUp = emailAndPassword.enabled && emailAndPassword.signUp;

  return {
    ...data,
    emailSignIn,
    emailSignUp,
    canSignIn: emailSignIn || hasSocial,
    canSignUp: emailSignUp || hasSocial,
    canResetPassword: emailSignIn && emailAndPassword.resetPassword,
  };
}
