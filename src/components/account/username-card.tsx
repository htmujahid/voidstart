import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth/auth-client";

import { createUsernameFormSchema } from "./schemas";
import { SettingsCard } from "./settings-card";
import { TextField } from "./text-field";

export function UsernameCard() {
  const router = useRouter();
  const user = useUser();
  const { minUsernameLength, maxUsernameLength } = useAuthConfig().username;
  const schema = useMemo(
    () => createUsernameFormSchema({ minUsernameLength, maxUsernameLength }),
    [minUsernameLength, maxUsernameLength],
  );
  const currentUsername = (user as { username?: string | null } | null)?.username ?? "";

  const form = useForm({
    defaultValues: { username: currentUsername },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.updateUser({ username: value.username.trim() });
      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't update username",
          description: error.message ?? "Unable to update your username.",
        });
        return;
      }
      await router.invalidate();
      toast.add({ type: "success", title: "Username updated" });
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
        title="Username"
        description="Use your username to sign in instead of your email."
        footer={
          <form.Subscribe selector={(s) => [s.isSubmitting, s.isDefaultValue] as const}>
            {([isSubmitting, isDefaultValue]) => (
              <Button type="submit" disabled={isSubmitting || isDefaultValue}>
                {isSubmitting && <Spinner />}
                Save
              </Button>
            )}
          </form.Subscribe>
        }
      >
        <FieldGroup>
          <form.Field name="username">
            {(field) => (
              <TextField
                field={field}
                label="Username"
                autoComplete="username"
                description={`${minUsernameLength}–${maxUsernameLength} characters: letters, numbers, underscores and dots.`}
              />
            )}
          </form.Field>
        </FieldGroup>
      </SettingsCard>
    </form>
  );
}
