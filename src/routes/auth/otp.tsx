import { createFileRoute } from "@tanstack/react-router";

import { OtpForm } from "@/components/auth/otp-form";
import { redirectSearchSchema } from "@/lib/redirect";

export const Route = createFileRoute("/auth/otp")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect } = Route.useSearch();
  return <OtpForm redirectTo={redirect} />;
}
