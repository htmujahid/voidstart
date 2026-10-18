import { Link, createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/auth-card";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { buttonVariants } from "@/components/ui/button";
import { redirectSearchSchema } from "@/lib/redirect";
import { humanizeCode } from "@/lib/utils";

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect: redirectTo, error } = Route.useSearch();

  if (error) {
    return (
      <AuthCard
        title="Verification failed"
        description={`${humanizeCode(error)}. Request a new link below.`}
      >
        <ResendVerificationForm redirectTo={redirectTo} />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Email verified" description="Your email address is confirmed.">
      <Link
        to="/auth/sign-in"
        search={{ redirect: redirectTo }}
        className={buttonVariants({ className: "w-full" })}
      >
        Continue to sign in
      </Link>
    </AuthCard>
  );
}
