import { createFileRoute } from "@tanstack/react-router";

import { TwoFactorOtpForm } from "@/components/auth/two-factor-otp-form";
import { redirectSearchSchema } from "@/lib/redirect";

export const Route = createFileRoute("/auth/two-factor/otp")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect } = Route.useSearch();
  return <TwoFactorOtpForm redirectTo={redirect} />;
}
