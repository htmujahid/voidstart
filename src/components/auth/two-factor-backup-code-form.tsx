import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import * as z from "zod";

import { TextField } from "@/components/account/text-field";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/auth-client";
import { safeRedirect } from "@/lib/redirect";

import { AuthCard } from "./auth-card";
import { TrustDeviceField } from "./trust-device-field";
import { TwoFactorLinks } from "./two-factor-links";
import { useTwoFactorError } from "./use-two-factor-error";

const backupCodeSchema = z.object({
  code: z.string().trim().min(1, "Backup code is required."),
});

export function TwoFactorBackupCodeForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const handleError = useTwoFactorError(redirectTo);
  const [trustDevice, setTrustDevice] = useState(false);

  const form = useForm({
    defaultValues: { code: "" },
    validators: { onSubmit: backupCodeSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.twoFactor.verifyBackupCode({
        code: value.code.trim(),
        trustDevice,
      });
      if (error) {
        handleError(error);
        return;
      }
      toast.add({
        type: "success",
        title: "Signed in",
        description: "That backup code can't be used again.",
      });
      router.history.push(safeRedirect(redirectTo));
    },
  });

  return (
    <AuthCard
      title="Two-factor authentication"
      description="Enter one of your backup codes to finish signing in."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="code">
            {(field) => (
              <TextField
                field={field}
                label="Backup code"
                autoComplete="one-time-code"
                autoCapitalize="none"
                spellCheck={false}
              />
            )}
          </form.Field>
          <TrustDeviceField checked={trustDevice} onChange={setTrustDevice} />
          <Field>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Verify
                </Button>
              )}
            </form.Subscribe>
          </Field>
          <TwoFactorLinks current="backup-code" redirectTo={redirectTo} />
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
