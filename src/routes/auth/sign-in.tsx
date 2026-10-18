import { createFileRoute } from "@tanstack/react-router";

import { SignInForm } from "@/components/auth/sign-in-form";
import { redirectSearchSchema } from "@/lib/redirect";

export const Route = createFileRoute("/auth/sign-in")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect } = Route.useSearch();
  return <SignInForm redirectTo={redirect} />;
}
