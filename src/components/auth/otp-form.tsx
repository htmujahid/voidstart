import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { formatDuration } from "@/lib/duration";
import { safeRedirect } from "@/lib/redirect";

import { AuthCard } from "./auth-card";
import { AuthMethodLinks } from "./auth-method-links";
import { AuthNotice } from "./auth-notice";
import { EmailStepForm } from "./email-step-form";

export function OtpForm({ redirectTo }: { redirectTo?: string }) {
  const { appName, emailOtp } = useAuthConfig();
  const [email, setEmail] = useState<string | null>(null);

  async function sendCode(address: string) {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: address,
      type: "sign-in",
    });
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't send code",
        description: error.message ?? "Unable to send the verification code.",
      });
      return false;
    }
    return true;
  }

  if (!emailOtp.enabled) {
    return (
      <AuthNotice
        title="Email code unavailable"
        description={`${appName} doesn't support signing in with an email code.`}
        redirectTo={redirectTo}
      />
    );
  }

  return (
    <AuthCard
      title="Sign in with an email code"
      description={
        emailOtp.signUp
          ? "We'll email you a code. New here? We'll create your account."
          : "We'll email you a code to sign in."
      }
    >
      {email ? (
        <OtpCodeStep
          email={email}
          length={emailOtp.otpLength}
          expiresIn={emailOtp.expiresIn}
          redirectTo={redirectTo}
          onResend={() => sendCode(email)}
          onChangeEmail={() => setEmail(null)}
        />
      ) : (
        <EmailStepForm
          submitLabel="Email me a code"
          onSubmit={async (address) => {
            if (await sendCode(address)) setEmail(address);
          }}
        >
          <AuthMethodLinks current="otp" redirectTo={redirectTo} />
        </EmailStepForm>
      )}
    </AuthCard>
  );
}

function OtpCodeStep({
  email,
  length,
  expiresIn,
  redirectTo,
  onResend,
  onChangeEmail,
}: {
  email: string;
  length: number;
  expiresIn: number;
  redirectTo?: string;
  onResend: () => Promise<boolean>;
  onChangeEmail: () => void;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  async function verify(otp: string) {
    setVerifying(true);
    const { error } = await authClient.signIn.emailOtp({ email, otp });
    if (error) {
      setVerifying(false);
      setCode("");
      toast.add({
        type: "error",
        title: "Sign in failed",
        description: error.message ?? "Invalid or expired code.",
      });
      return;
    }
    router.history.push(safeRedirect(redirectTo));
  }

  async function resend() {
    setResending(true);
    const ok = await onResend();
    setResending(false);
    if (ok) {
      setCode("");
      toast.add({ type: "success", title: "Code sent", description: `Check ${email}.` });
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === length) void verify(code);
      }}
    >
      <FieldGroup>
        <Field className="items-center">
          <FieldLabel htmlFor="otp">Verification code</FieldLabel>
          <InputOTP
            id="otp"
            maxLength={length}
            pattern={REGEXP_ONLY_DIGITS}
            autoComplete="one-time-code"
            value={code}
            onChange={setCode}
            onComplete={verify}
            disabled={verifying}
          >
            <InputOTPGroup>
              {Array.from({ length }, (_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription className="text-center">
            We sent a {length}-digit code to <strong>{email}</strong>. It expires in{" "}
            {formatDuration(expiresIn)}.
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={verifying || code.length !== length}>
            {verifying && <Spinner />}
            Sign in
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={resending || verifying}
            onClick={resend}
          >
            {resending && <Spinner />}
            Resend code
          </Button>
          <Button type="button" variant="ghost" disabled={verifying} onClick={onChangeEmail}>
            Use a different email
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
