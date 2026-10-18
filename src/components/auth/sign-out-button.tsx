import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export function SignOutButton() {
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await authClient.signOut();
        await navigate({ to: "/auth/sign-in" });
      }}
    >
      Sign out
    </Button>
  );
}
