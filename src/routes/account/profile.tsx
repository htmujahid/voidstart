import { createFileRoute } from "@tanstack/react-router";

import { DangerZone } from "@/components/account/danger-zone";
import { EmailCard } from "@/components/account/email-card";
import { ProfileForm } from "@/components/account/profile-form";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { accountsQueryOptions } from "@/lib/queries/auth";

export const Route = createFileRoute("/account/profile")({
  loader: ({ context: { queryClient } }) => queryClient.query(accountsQueryOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthConfig();

  return (
    <>
      <ProfileForm />
      <EmailCard />
      {user.deleteUser && <DangerZone />}
    </>
  );
}
