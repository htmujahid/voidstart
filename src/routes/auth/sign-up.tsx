import { createFileRoute } from "@tanstack/react-router";

import { PasswordSignUpForm } from "@/components/auth/password-sign-up-form";
import { redirectSearchSchema } from "@/lib/redirect";

export const Route = createFileRoute("/auth/sign-up")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect } = Route.useSearch();
  return <PasswordSignUpForm redirectTo={redirect} />;
}
