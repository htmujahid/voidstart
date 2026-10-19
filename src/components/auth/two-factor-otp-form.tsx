import { useState } from "react";
import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { formatDuration } from "@/lib/duration";
import { safeRedirect } from "@/lib/redirect";

import { AuthCard } from "./auth-card";
import { AuthNotice } from "./auth-notice";
import { CodeInput } from "./code-input";
import { TrustDeviceField } from "./trust-device-field";
import { TwoFactorLinks } from "./two-factor-links";
import { useTwoFactorError } from "./use-two-factor-error";

export function TwoFactorOtpForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const { appName, twoFactor } = useAuthConfig();
  const handleError = useTwoFactorError(redirectTo);
  const { digits, expiresIn } = twoFactor.otp;
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function send() {
    setSending(true);
    const { error } = await authClient.twoFactor.sendOtp();
    setSending(false);
    if (error) {
      handleError(error);
      return;
    }
    setSent(true);
    setCode("");
    toast.add({ type: "success", title: "Code sent", description: "Check your email." });
  }

  async function verify(value: string) {
    setVerifying(true);
    const { error } = await authClient.twoFactor.verifyOtp({ code: value, trustDevice });
    if (error) {
      setVerifying(false);
      setCode("");
      if (handleError(error)) setSent(false);
      return;
    }
    toast.add({ type: "success", title: "Signed in" });
    router.history.push(safeRedirect(redirectTo));
  }

  if (!twoFactor.otp.enabled) {
    return (
      <AuthNotice
        title="Email code unavailable"
        description={`${appName} doesn't support email codes for two-factor authentication.`}
        redirectTo={redirectTo}
      />
    );
  }

  return (
    <AuthCard
      title="Two-factor authentication"
      description={
        sent
          ? `Enter the ${digits}-digit code we emailed you.`
          : "We'll email you a code to finish signing in."
      }
    >
      {sent ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === digits) void verify(code);
          }}
        >
          <FieldGroup>
            <Field className="items-center">
              <FieldLabel htmlFor="otp-code">Email code</FieldLabel>
              <CodeInput
                id="otp-code"
                length={digits}
                value={code}
                onChange={setCode}
                onComplete={verify}
                disabled={verifying}
              />
              <FieldDescription className="text-center">
                The code expires in {formatDuration(expiresIn)}.
              </FieldDescription>
            </Field>
            <TrustDeviceField
              checked={trustDevice}
              onChange={setTrustDevice}
              disabled={verifying}
            />
            <Field>
              <Button type="submit" disabled={verifying || code.length !== digits}>
                {verifying && <Spinner />}
                Verify
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={sending || verifying}
                onClick={send}
              >
                {sending && <Spinner />}
                Resend code
              </Button>
            </Field>
            <TwoFactorLinks current="otp" redirectTo={redirectTo} />
          </FieldGroup>
        </form>
      ) : (
        <FieldGroup>
          <Field>
            <Button type="button" disabled={sending} onClick={send}>
              {sending && <Spinner />}
              Email me a code
            </Button>
          </Field>
          <TwoFactorLinks current="otp" redirectTo={redirectTo} />
        </FieldGroup>
      )}
    </AuthCard>
  );
}
