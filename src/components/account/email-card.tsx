import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth/auth-client";

import { changeEmailSchema } from "./schemas";
import { SettingsCard } from "./settings-card";
import { TextField } from "./text-field";

const CALLBACK_URL = "/account/profile";

export function EmailCard() {
  const user = useUser();
  const { user: userConfig, emailVerification } = useAuthConfig();
  const [resending, setResending] = useState(false);

  const form = useForm({
    defaultValues: { newEmail: "" },
    validators: { onSubmit: changeEmailSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.changeEmail({
        newEmail: value.newEmail,
        callbackURL: CALLBACK_URL,
      });
      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't change email",
          description: error.message ?? "Unable to change your email address.",
        });
        return;
      }
      toast.add(
        user?.emailVerified
          ? {
              type: "success",
              title: "Check your current inbox",
              description: `Approve the change from the link we sent to ${user.email}. We'll then ask you to confirm ${value.newEmail}.`,
            }
          : {
              type: "success",
              title: "Check your new inbox",
              description: `We sent a confirmation link to ${value.newEmail}.`,
            },
      );
      form.reset();
    },
  });

  if (!user) return null;

  async function resend() {
    if (!user) return;
    setResending(true);
    const { error } = await authClient.sendVerificationEmail({
      email: user.email,
      callbackURL: CALLBACK_URL,
    });
    setResending(false);
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
      description: `Check ${user.email} for the link.`,
    });
  }

  const status = (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium">{user.email}</span>
      <Badge variant={user.emailVerified ? "secondary" : "outline"}>
        {user.emailVerified ? "Verified" : "Unverified"}
      </Badge>
    </div>
  );

  const resendButton = !user.emailVerified && emailVerification.enabled && (
    <Button type="button" variant="outline" disabled={resending} onClick={resend}>
      {resending && <Spinner />}
      Resend verification email
    </Button>
  );

  if (!userConfig.changeEmail) {
    return (
      <SettingsCard
        title="Email"
        description="The address you use to sign in."
        footer={resendButton || undefined}
      >
        {status}
      </SettingsCard>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <SettingsCard
        title="Email"
        description={
          user.emailVerified
            ? "Changing your email needs approval from your current address, then confirmation of the new one."
            : "Changing your email requires confirming the new address."
        }
        footer={
          <>
            {resendButton}
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Change email
                </Button>
              )}
            </form.Subscribe>
          </>
        }
      >
        <FieldGroup>
          {status}
          <form.Field
            name="newEmail"
            validators={{
              onSubmit: ({ value }) =>
                value.trim().toLowerCase() === user.email.toLowerCase()
                  ? "That's already your email address."
                  : undefined,
            }}
          >
            {(field) => (
              <TextField
                field={field}
                label="New email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            )}
          </form.Field>
        </FieldGroup>
      </SettingsCard>
    </form>
  );
}
