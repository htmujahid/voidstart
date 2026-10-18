import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth/auth-client";

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async () => {
    await authClient.signOut();
    queryClient.clear();
    await navigate({ to: "/auth/sign-in" });
  };
}
