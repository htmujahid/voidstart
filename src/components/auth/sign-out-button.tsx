import { useNavigate } from "@tanstack/react-router";
import { auth } from "void/client/react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await auth.signOut();
        await navigate({ to: "/auth/sign-in" });
      }}
    >
      Sign out
    </Button>
  );
}
