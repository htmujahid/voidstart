import { createFileRoute } from "@tanstack/react-router";

import { AccessCard } from "@/components/account/access-card";
import { DangerZone } from "@/components/account/danger-zone";
import { EmailCard } from "@/components/account/email-card";
import { ProfileForm } from "@/components/account/profile-form";
import { UsernameCard } from "@/components/account/username-card";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { accountsQueryOptions } from "@/lib/queries/auth";

export const Route = createFileRoute("/account/profile")({
  loader: ({ context: { queryClient } }) => queryClient.query(accountsQueryOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const { user, username } = useAuthConfig();

  return (
    <>
      <ProfileForm />
      <AccessCard />
      {username.enabled && <UsernameCard />}
      <EmailCard />
      {user.deleteUser && <DangerZone />}
    </>
  );
}
