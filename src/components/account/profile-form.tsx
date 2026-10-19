import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth/auth-client";
import { AVATAR_ACCEPT, AVATAR_MAX_SIZE, deleteAvatar, uploadAvatar } from "@/lib/avatar";
import { userInitials } from "@/lib/user";

import { AvatarPicker } from "./avatar-picker";
import { profileSchema } from "./schemas";
import { SettingsCard } from "./settings-card";
import { TextField } from "./text-field";

export function ProfileForm() {
  const router = useRouter();
  const user = useUser();
  const [removed, setRemoved] = useState(false);

  const [{ files, isDragging }, upload] = useFileUpload({
    accept: AVATAR_ACCEPT,
    maxSize: AVATAR_MAX_SIZE,
    onFilesAdded: () => setRemoved(false),
    onError: (errors) =>
      toast.add({ type: "error", title: "Couldn't use that image", description: errors[0] }),
  });

  const picked = files[0];
  const pickedFile = picked?.file instanceof File ? picked.file : null;
  const currentImage = removed ? undefined : (picked?.preview ?? user?.image ?? undefined);
  const avatarChanged = pickedFile !== null || (removed && Boolean(user?.image));

  const form = useForm({
    defaultValues: { name: user?.name ?? "" },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      const update: { name: string; image?: string | null } = { name: value.name.trim() };

      try {
        if (pickedFile) {
          update.image = await uploadAvatar(pickedFile);
        } else if (removed && user?.image) {
          await deleteAvatar();
          update.image = null;
        }
      } catch (error) {
        toast.add({
          type: "error",
          title: "Couldn't update photo",
          description: error instanceof Error ? error.message : "Something went wrong.",
        });
        return;
      }

      const { error } = await authClient.updateUser(update);
      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't update profile",
          description: error.message ?? "Unable to update your profile.",
        });
        return;
      }
      upload.clearFiles();
      setRemoved(false);
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
        description="Your photo and name are shown across the workspace."
        footer={
          <form.Subscribe selector={(s) => [s.isSubmitting, s.isDefaultValue] as const}>
            {([isSubmitting, isDefaultValue]) => (
              <Button type="submit" disabled={isSubmitting || (isDefaultValue && !avatarChanged)}>
                {isSubmitting && <Spinner />}
                Save
              </Button>
            )}
          </form.Subscribe>
        }
      >
        <FieldGroup>
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <AvatarPicker
                src={currentImage}
                initials={user ? userInitials(user) : ""}
                pendingFile={pickedFile}
                isDragging={isDragging}
                disabled={isSubmitting}
                canRemove={Boolean(currentImage)}
                actions={upload}
                onRemove={() => {
                  upload.clearFiles();
                  setRemoved(true);
                }}
              />
            )}
          </form.Subscribe>
          <form.Field name="name">
            {(field) => <TextField field={field} label="Name" autoComplete="name" />}
          </form.Field>
        </FieldGroup>
      </SettingsCard>
    </form>
  );
}
