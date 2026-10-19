import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { KeyRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { isPasskeyCancelled, usePasskeySupported } from "@/lib/auth/passkey";
import { safeRedirect } from "@/lib/redirect";

export function PasskeySignInButton({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const { passkey } = useAuthConfig();
  const supported = usePasskeySupported();
  const [pending, setPending] = useState(false);

  if (!passkey.enabled || !supported) return null;

  async function signIn() {
    setPending(true);
    const { error } = await authClient.signIn.passkey();
    if (error) {
      setPending(false);
      if (!isPasskeyCancelled(error)) {
        toast.add({
          type: "error",
          title: "Passkey sign in failed",
          description: error.message ?? "Unable to sign in with a passkey.",
        });
      }
      return;
    }
    router.history.push(safeRedirect(redirectTo));
  }

  return (
    <Button type="button" variant="secondary" disabled={pending} onClick={signIn}>
      {pending ? <Spinner /> : <KeyRoundIcon />}
      Passkey
    </Button>
  );
}
