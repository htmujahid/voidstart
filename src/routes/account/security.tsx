import { createFileRoute, redirect } from "@tanstack/react-router";

import { PasskeysCard } from "@/components/account/passkeys-card";
import { PasswordCard } from "@/components/account/password-card";
import { TwoFactorCard } from "@/components/account/two-factor-card";
import { useAuthConfig } from "@/hooks/use-auth-config";
import {
  accountsQueryOptions,
  authConfigQueryOptions,
  passkeysQueryOptions,
} from "@/lib/queries/auth";

export const Route = createFileRoute("/account/security")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const config = await queryClient.query(authConfigQueryOptions);
    if (!config.emailAndPassword.enabled && !config.passkey.enabled) {
      throw redirect({ to: "/account/profile" });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    const config = await queryClient.query(authConfigQueryOptions);
    await Promise.all([
      queryClient.query(accountsQueryOptions),
      config.passkey.enabled ? queryClient.query(passkeysQueryOptions) : undefined,
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { emailSignIn } = useAuthConfig();
  return (
    <>
      {emailSignIn && <PasswordCard />}
      {emailSignIn && <TwoFactorCard />}
      <PasskeysCard />
    </>
  );
}
