import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { formatDuration } from "@/lib/duration";
import { verifyEmailCallbackURL } from "@/lib/redirect";

export function VerifyEmailNotice({ email, redirectTo }: { email: string; redirectTo?: string }) {
  const { emailVerification } = useAuthConfig();
  const [sending, setSending] = useState(false);

  async function resend() {
    setSending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: verifyEmailCallbackURL(redirectTo),
    });
    setSending(false);
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't send email",
        description: error.message ?? "Unable to send the verification email.",
      });
      return;
    }
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
          : "Then come back and sign in."}{" "}
        The link expires in {formatDuration(emailVerification.expiresIn)}.
      </FieldDescription>
      <Button type="button" variant="outline" disabled={sending} onClick={resend}>
        {sending && <Spinner />}
        Resend verification email
      </Button>
      <FieldDescription className="text-center">
        <Link to="/auth/sign-in" search={{ redirect: redirectTo }}>
          Back to sign in
        </Link>
      </FieldDescription>
    </FieldGroup>
  );
}
