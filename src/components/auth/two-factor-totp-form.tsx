import { useState } from "react";
import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { safeRedirect } from "@/lib/redirect";

import { AuthCard } from "./auth-card";
import { AuthNotice } from "./auth-notice";
import { CodeInput } from "./code-input";
import { TrustDeviceField } from "./trust-device-field";
import { TwoFactorLinks } from "./two-factor-links";
import { useTwoFactorError } from "./use-two-factor-error";

export function TwoFactorTotpForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const { appName, twoFactor } = useAuthConfig();
  const handleError = useTwoFactorError(redirectTo);
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function verify(value: string) {
    setVerifying(true);
    const { error } = await authClient.twoFactor.verifyTotp({ code: value, trustDevice });
    if (error) {
      setVerifying(false);
      setCode("");
      handleError(error);
      return;
    }
    toast.add({ type: "success", title: "Signed in" });
    router.history.push(safeRedirect(redirectTo));
  }

  if (!twoFactor.totp.enabled) {
    return (
      <AuthNotice
        title="Authenticator app unavailable"
        description={`${appName} doesn't support authenticator app codes.`}
        redirectTo={redirectTo}
      />
    );
  }

  return (
    <AuthCard
      title="Two-factor authentication"
      description={`Enter the ${twoFactor.totp.digits}-digit code from your authenticator app.`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === twoFactor.totp.digits) void verify(code);
        }}
      >
        <FieldGroup>
          <Field className="items-center">
            <FieldLabel htmlFor="totp-code">Authentication code</FieldLabel>
            <CodeInput
              id="totp-code"
              length={twoFactor.totp.digits}
              value={code}
              onChange={setCode}
              onComplete={verify}
              disabled={verifying}
            />
          </Field>
          <TrustDeviceField checked={trustDevice} onChange={setTrustDevice} disabled={verifying} />
          <Field>
            <Button type="submit" disabled={verifying || code.length !== twoFactor.totp.digits}>
              {verifying && <Spinner />}
              Verify
            </Button>
          </Field>
          <TwoFactorLinks current="totp" redirectTo={redirectTo} />
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
