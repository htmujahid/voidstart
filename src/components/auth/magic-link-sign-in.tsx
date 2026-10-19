import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { formatDuration } from "@/lib/duration";
import { safeRedirect } from "@/lib/redirect";

import { EmailStepForm } from "./email-step-form";

export function MagicLinkSignIn({ redirectTo }: { redirectTo?: string }) {
  const { magicLink } = useAuthConfig();
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function send(email: string) {
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: safeRedirect(redirectTo),
      errorCallbackURL: "/auth/sign-in",
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

  if (sentTo) {
    return (
      <FieldGroup>
        <FieldDescription className="text-center">
          We sent a sign-in link to <strong>{sentTo}</strong>. It expires in{" "}
          {formatDuration(magicLink.expiresIn)}.
        </FieldDescription>
        <Button type="button" variant="outline" onClick={() => setSentTo(null)}>
          Use a different email
        </Button>
      </FieldGroup>
    );
  }

  return <EmailStepForm submitLabel="Email me a sign-in link" onSubmit={send} />;
}
