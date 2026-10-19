import { useSuspenseQuery } from "@tanstack/react-query";

import { authConfigQueryOptions } from "@/lib/queries/auth";

export function useAuthConfig() {
  const { data } = useSuspenseQuery(authConfigQueryOptions);
  const { emailAndPassword, socialProviders } = data;
  const hasSocial = socialProviders.length > 0;
  const emailSignIn = emailAndPassword.enabled;
  const { magicLink, emailOtp } = data;
  const emailSignUp = emailAndPassword.enabled && emailAndPassword.signUp;
  const passwordlessSignUp =
    (magicLink.enabled && magicLink.signUp) || (emailOtp.enabled && emailOtp.signUp);

  return {
    ...data,
    emailSignIn,
    emailSignUp,
    canSignIn: emailSignIn || magicLink.enabled || emailOtp.enabled || hasSocial,
    canSignUp: emailSignUp || passwordlessSignUp || hasSocial,
    canResetPassword: emailSignIn && emailAndPassword.resetPassword,
    canLinkAccounts: data.account.linking && hasSocial,
  };
}
