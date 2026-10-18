import { createFileRoute, redirect } from "@tanstack/react-router";

import { PasswordCard } from "@/components/account/password-card";
import { accountsQueryOptions, authConfigQueryOptions } from "@/lib/queries/auth";

export const Route = createFileRoute("/account/security")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const config = await queryClient.query(authConfigQueryOptions);
    if (!config.emailAndPassword.enabled) throw redirect({ to: "/account/profile" });
  },
  loader: ({ context: { queryClient } }) => queryClient.query(accountsQueryOptions),
  component: PasswordCard,
});
