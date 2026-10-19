import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { formatDuration } from "@/lib/duration";
import { safeRedirect } from "@/lib/redirect";

import { AuthCard } from "./auth-card";
import { AuthMethodLinks } from "./auth-method-links";
import { AuthNotice } from "./auth-notice";
import { EmailStepForm } from "./email-step-form";

export function MagicLinkForm({ redirectTo }: { redirectTo?: string }) {
  const { appName, magicLink } = useAuthConfig();
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function send(email: string) {
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: safeRedirect(redirectTo),
      errorCallbackURL: "/auth/magic-link",
    });
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't send link",
        description: error.message ?? "Unable to send the sign-in link.",
      });
      return;
    }
    setSentTo(email);
  }

  if (!magicLink.enabled) {
    return (
      <AuthNotice
        title="Magic link unavailable"
        description={`${appName} doesn't support signing in with a magic link.`}
        redirectTo={redirectTo}
      />
    );
  }

  return (
    <AuthCard
      title="Sign in with a magic link"
      description={
        magicLink.signUp
          ? "We'll email you a link. New here? We'll create your account."
          : "We'll email you a link to sign in."
      }
    >
      {sentTo ? (
        <FieldGroup>
          <FieldDescription className="text-center">
            We sent a sign-in link to <strong>{sentTo}</strong>. It expires in{" "}
            {formatDuration(magicLink.expiresIn)}.
          </FieldDescription>
          <Button type="button" variant="outline" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </FieldGroup>
      ) : (
        <EmailStepForm submitLabel="Email me a sign-in link" onSubmit={send}>
          <AuthMethodLinks current="magic-link" redirectTo={redirectTo} />
        </EmailStepForm>
      )}
    </AuthCard>
  );
}
