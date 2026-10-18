import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: z.object({ token: z.string().optional() }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();
  return <ResetPasswordForm token={token} />;
}
