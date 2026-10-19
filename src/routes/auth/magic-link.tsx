import { createFileRoute } from "@tanstack/react-router";

import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { useAuthErrorToast } from "@/hooks/use-auth-error-toast";
import { redirectSearchSchema } from "@/lib/redirect";

export const Route = createFileRoute("/auth/magic-link")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect, error } = Route.useSearch();
  useAuthErrorToast(error);
  return <MagicLinkForm redirectTo={redirect} />;
}
