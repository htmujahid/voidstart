import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { safeRedirect } from "@/lib/redirect";

export function VerifyEmailNotice({ email, redirectTo }: { email: string; redirectTo?: string }) {
  const { emailVerification } = useAuthConfig();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function resend() {
    setStatus("sending");
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: safeRedirect(redirectTo),
    });
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't send email",
        description: error.message ?? "Unable to send the verification email.",
      });
      setStatus("idle");
      return;
    }
    setStatus("sent");
    toast.add({
      type: "success",
      title: "Verification email sent",
      description: `Check ${email} for the link.`,
    });
  }

  return (
    <FieldGroup>
      <FieldDescription className="text-center">
        We sent a verification link to <strong>{email}</strong>. Open it to activate your account.{" "}
        {emailVerification.autoSignInAfterVerification
          ? "You'll be signed in automatically."
          : "Then come back and sign in."}
      </FieldDescription>
      <Button type="button" variant="outline" disabled={status === "sending"} onClick={resend}>
        {status === "sending" && <Spinner />}
        {status === "sent" ? "Sent. Resend again" : "Resend verification email"}
      </Button>
      <FieldDescription className="text-center">
        <Link to="/auth/sign-in" search={{ redirect: redirectTo }}>
          Back to sign in
        </Link>
      </FieldDescription>
    </FieldGroup>
  );
}
