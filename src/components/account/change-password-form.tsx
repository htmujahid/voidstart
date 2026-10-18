import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { sessionsQueryOptions } from "@/lib/queries/auth";

import { createChangePasswordSchema } from "./schemas";
import { SettingsCard } from "./settings-card";
import { TextField } from "./text-field";

export function ChangePasswordForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { emailAndPassword } = useAuthConfig();
  const { minPasswordLength, maxPasswordLength } = emailAndPassword;
  const schema = useMemo(
    () => createChangePasswordSchema({ minPasswordLength, maxPasswordLength }),
    [minPasswordLength, maxPasswordLength],
  );

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: true,
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: value.revokeOtherSessions,
      });
      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't change password",
          description: error.message ?? "Unable to change your password.",
        });
        return;
      }
      await Promise.all([
        router.invalidate(),
        queryClient.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey }),
      ]);
      toast.add({ type: "success", title: "Password updated" });
      form.reset();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <SettingsCard
        title="Password"
        description="Use a strong password you don't use anywhere else."
        footer={
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner />}
                Update password
              </Button>
            )}
          </form.Subscribe>
        }
      >
        <FieldGroup>
          <form.Field name="currentPassword">
            {(field) => (
              <TextField
                field={field}
                label="Current password"
                type="password"
                autoComplete="current-password"
              />
            )}
          </form.Field>
          <form.Field name="newPassword">
            {(field) => (
              <TextField
                field={field}
                label="New password"
                type="password"
                autoComplete="new-password"
                description={`Must be at least ${minPasswordLength} characters.`}
              />
            )}
          </form.Field>
          <form.Field name="confirmPassword">
            {(field) => (
              <TextField
                field={field}
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
              />
            )}
          </form.Field>
          <form.Field name="revokeOtherSessions">
            {(field) => (
              <Field orientation="horizontal">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                />
                <FieldLabel htmlFor={field.name}>Sign out of all other devices</FieldLabel>
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </SettingsCard>
    </form>
  );
}
