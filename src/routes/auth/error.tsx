import { Link, createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { AuthCard } from "@/components/auth/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { humanizeCode } from "@/lib/utils";

export const Route = createFileRoute("/auth/error")({
  validateSearch: z.object({
    error: z.string().optional().catch(undefined),
    error_description: z.string().optional().catch(undefined),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { error, error_description } = Route.useSearch();
  const description =
    error_description ?? (error ? `${humanizeCode(error)}.` : "We couldn't complete that request.");

  return (
    <AuthCard title="Authentication failed" description={description}>
      <div className="flex flex-col gap-4">
        <Link to="/auth/sign-in" className={buttonVariants({ className: "w-full" })}>
          Back to sign in
        </Link>
        {error && (
          <FieldDescription className="text-center">
            Error code: <code>{error}</code>
          </FieldDescription>
        )}
      </div>
    </AuthCard>
  );
}
