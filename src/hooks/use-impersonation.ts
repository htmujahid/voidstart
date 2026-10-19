import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";

import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/auth-client";

export function useImpersonation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const impersonating = useRouteContext({
    from: "__root__",
    select: (ctx) => Boolean(ctx.session?.impersonatedBy),
  });

  async function stop() {
    const { error } = await authClient.admin.stopImpersonating();
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't stop impersonating",
        description: error.message ?? "Something went wrong.",
      });
      return;
    }
    queryClient.clear();
    await navigate({ to: "/admin" });
  }

  return { impersonating, stop };
}
