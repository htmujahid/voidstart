import { createFileRoute } from "@tanstack/react-router";

import { PasswordSignInForm } from "@/components/auth/password-sign-in-form";
import { useAuthErrorToast } from "@/hooks/use-auth-error-toast";
import { redirectSearchSchema } from "@/lib/redirect";

export const Route = createFileRoute("/auth/sign-in")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect, error } = Route.useSearch();
  useAuthErrorToast(error);
  return <PasswordSignInForm redirectTo={redirect} />;
}
