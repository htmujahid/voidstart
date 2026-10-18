import { useSuspenseQuery } from "@tanstack/react-query";

import { accountsQueryOptions } from "@/lib/queries/auth";

import { ChangePasswordForm } from "./change-password-form";
import { SettingsCard } from "./settings-card";

export function PasswordCard() {
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions);
  const hasPassword = accounts.some((account) => account.providerId === "credential");

  if (hasPassword) return <ChangePasswordForm />;

  return (
    <SettingsCard
      title="Password"
      description="You sign in with a connected account, so no password is set."
    />
  );
}
