import { createFileRoute } from "@tanstack/react-router";

import { TwoFactorTotpForm } from "@/components/auth/two-factor-totp-form";
import { redirectSearchSchema } from "@/lib/redirect";

export const Route = createFileRoute("/auth/two-factor/")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect } = Route.useSearch();
  return <TwoFactorTotpForm redirectTo={redirect} />;
}
