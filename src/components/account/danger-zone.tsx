import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { accountsQueryOptions } from "@/lib/queries/auth";

import { deleteAccountSchema } from "./schemas";
import { SettingsCard } from "./settings-card";
import { TextField } from "./text-field";

export function DangerZone() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: userConfig } = useAuthConfig();
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions);
  const [open, setOpen] = useState(false);
  const hasPassword = accounts.some((account) => account.providerId === "credential");
  const needsEmail = !hasPassword && userConfig.deleteUserVerification;

  const form = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: deleteAccountSchema },
    onSubmit: async ({ value }) => {
      if (hasPassword && !value.password) {
        toast.add({
          type: "error",
          title: "Password required",
          description: "Enter your password to continue.",
        });
        return;
      }
      const { error } = await authClient.deleteUser({
        password: hasPassword ? value.password : undefined,
        callbackURL: "/auth/sign-in",
      });
      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't delete account",
          description: error.message ?? "Unable to delete your account.",
        });
        return;
      }
      if (needsEmail) {
        setOpen(false);
        form.reset();
        toast.add({
          type: "success",
          title: "Check your email",
          description: "Open the confirmation link to finish deleting your account.",
        });
        return;
      }
      queryClient.clear();
      await navigate({ to: "/auth/sign-in" });
    },
  });

  return (
    <SettingsCard
      title="Danger zone"
      description="Deleting your account permanently removes your profile, connections and sessions. This can't be undone."
      footer={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="destructive" />}>Delete account</DialogTrigger>
          <DialogContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
              }}
            >
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  {needsEmail
                    ? "We'll email you a link to confirm. Your account is deleted once you open it."
                    : "This permanently deletes your account and can't be undone."}
                </DialogDescription>
              </DialogHeader>
              {hasPassword && (
                <FieldGroup>
                  <form.Field name="password">
                    {(field) => (
                      <TextField
                        field={field}
                        label="Confirm your password"
                        type="password"
                        autoComplete="current-password"
                      />
                    )}
                  </form.Field>
                </FieldGroup>
              )}
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>
                  Cancel
                </DialogClose>
                <form.Subscribe selector={(s) => s.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" variant="destructive" disabled={isSubmitting}>
                      {isSubmitting && <Spinner />}
                      {needsEmail ? "Send confirmation email" : "Delete account"}
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    />
  );
}
