import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { SignInForm } from "@/components/auth/sign-in-form";
import { toast } from "@/components/ui/toast";
import { redirectSearchSchema } from "@/lib/redirect";

export const Route = createFileRoute("/auth/sign-in")({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect, error } = Route.useSearch();

  useEffect(() => {
    if (!error) return;
    toast.add({
      type: "error",
      title: "Sign in failed",
      description: error.replaceAll("_", " "),
    });
  }, [error]);

  return <SignInForm redirectTo={redirect} />;
}
