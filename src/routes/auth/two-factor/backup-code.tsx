import { createFileRoute } from "@tanstack/react-router";

import { TwoFactorBackupCodeForm } from "@/components/auth/two-factor-backup-code-form";
import { redirectSearchSchema } from "@/lib/redirect";

export const Route = createFileRoute("/auth/two-factor/backup-code")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect } = Route.useSearch();
  return <TwoFactorBackupCodeForm redirectTo={redirect} />;
}
