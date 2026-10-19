import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

import { authClient } from "@/lib/auth/auth-client";
import { usePasskeySupported } from "@/lib/auth/passkey";
import { safeRedirect } from "@/lib/redirect";

import { useAuthConfig } from "./use-auth-config";

export function usePasskeyAutofill(redirectTo?: string) {
  const router = useRouter();
  const { passkey } = useAuthConfig();
  const supported = usePasskeySupported();
  const enabled = passkey.enabled && supported;

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    void (async () => {
      const available = await PublicKeyCredential.isConditionalMediationAvailable?.();
      if (!available || !active) return;
      const { data } = await authClient.signIn.passkey({ autoFill: true });
      if (active && data) router.history.push(safeRedirect(redirectTo));
    })();
    return () => {
      active = false;
    };
  }, [enabled, redirectTo, router]);
}
