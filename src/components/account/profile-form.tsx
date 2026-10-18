import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth/auth-client";

import { profileSchema } from "./schemas";
import { SettingsCard } from "./settings-card";
import { TextField } from "./text-field";

export function ProfileForm() {
  const router = useRouter();
  const user = useUser();

  const form = useForm({
    defaultValues: { name: user?.name ?? "" },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.updateUser({ name: value.name.trim() });
      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't update profile",
          description: error.message ?? "Unable to update your profile.",
        });
        return;
      }
      await router.invalidate();
      toast.add({ type: "success", title: "Profile updated" });
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
        title="Profile"
        description="Your name is shown across the workspace."
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
          <form.Field name="name">
            {(field) => <TextField field={field} label="Name" autoComplete="name" />}
          </form.Field>
        </FieldGroup>
      </SettingsCard>
    </form>
  );
}
