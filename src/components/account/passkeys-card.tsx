import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { KeyRoundIcon } from "lucide-react";
import * as z from "zod";

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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { isPasskeyCancelled, usePasskeySupported } from "@/lib/auth/passkey";
import { passkeysQueryOptions } from "@/lib/queries/auth";

import { SettingsCard } from "./settings-card";
import { TextField } from "./text-field";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

const addSchema = z.object({
  name: z.string().trim().max(60, "Name is too long."),
  attachment: z.enum(["any", "platform", "cross-platform"]),
});

type Attachment = z.infer<typeof addSchema>["attachment"];

export function PasskeysCard() {
  const queryClient = useQueryClient();
  const { passkey } = useAuthConfig();
  const supported = usePasskeySupported();
  const { data: passkeys } = useSuspenseQuery(passkeysQueryOptions);
  const [pending, setPending] = useState<string | null>(null);

  if (!passkey.enabled) return null;

  const refresh = () => queryClient.invalidateQueries({ queryKey: passkeysQueryOptions.queryKey });

  async function remove(id: string) {
    setPending(id);
    const { error } = await authClient.passkey.deletePasskey({ id });
    setPending(null);
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't remove passkey",
        description: error.message ?? "Unable to remove that passkey.",
      });
      return;
    }
    await refresh();
    toast.add({ type: "success", title: "Passkey removed" });
  }

  return (
    <SettingsCard
      title="Passkeys"
      description="Sign in with your fingerprint, face or device PIN instead of a password."
      footer={
        supported ? (
          <AddPasskeyDialog onAdded={refresh} />
        ) : (
          <FieldDescription>This browser doesn&apos;t support passkeys.</FieldDescription>
        )
      }
    >
      {passkeys.length === 0 ? (
        <FieldDescription>You haven&apos;t added any passkeys yet.</FieldDescription>
      ) : (
        <div className="-my-2 divide-y">
          {passkeys.map((item) => (
            <Item key={item.id} className="px-0">
              <ItemMedia variant="icon">
                <KeyRoundIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item.name || "Passkey"}</ItemTitle>
                <ItemDescription>
                  {item.deviceType === "multiDevice" ? "Synced passkey" : "This device only"}
                  {item.createdAt ? ` · Added ${dateFormat.format(new Date(item.createdAt))}` : ""}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <RenamePasskeyDialog id={item.id} name={item.name ?? ""} onRenamed={refresh} />
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending !== null}
                  onClick={() => remove(item.id)}
                >
                  {pending === item.id && <Spinner />}
                  Remove
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
      )}
    </SettingsCard>
  );
}

function AddPasskeyDialog({ onAdded }: { onAdded: () => Promise<unknown> }) {
  const { passkey } = useAuthConfig();
  const [open, setOpen] = useState(false);
  const fixedAttachment = passkey.authenticatorAttachment;

  const form = useForm({
    defaultValues: { name: "", attachment: "any" as Attachment },
    validators: { onSubmit: addSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.passkey.addPasskey({
        name: value.name.trim() || undefined,
        authenticatorAttachment: value.attachment === "any" ? undefined : value.attachment,
      });
      if (error) {
        if (!isPasskeyCancelled(error)) {
          toast.add({
            type: "error",
            title: "Couldn't add passkey",
            description: error.message ?? "Unable to register a passkey.",
          });
        }
        return;
      }
      setOpen(false);
      form.reset();
      await onAdded();
      toast.add({ type: "success", title: "Passkey added" });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger render={<Button />}>Add passkey</DialogTrigger>
      <DialogContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add a passkey</DialogTitle>
            <DialogDescription>
              Your browser will ask you to confirm with your device.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <form.Field name="name">
              {(field) => (
                <TextField
                  field={field}
                  label="Name (optional)"
                  placeholder="MacBook, YubiKey…"
                  description="Helps you tell your passkeys apart."
                />
              )}
            </form.Field>
            {!fixedAttachment && (
              <form.Field name="attachment">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Where to store it</FieldLabel>
                    <NativeSelect
                      id={field.name}
                      className="w-full"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as Attachment)}
                    >
                      <NativeSelectOption value="any">Let my browser choose</NativeSelectOption>
                      <NativeSelectOption value="platform">This device</NativeSelectOption>
                      <NativeSelectOption value="cross-platform">
                        Security key or another device
                      </NativeSelectOption>
                    </NativeSelect>
                  </Field>
                )}
              </form.Field>
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Continue
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RenamePasskeyDialog({
  id,
  name,
  onRenamed,
}: {
  id: string;
  name: string;
  onRenamed: () => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: { name },
    validators: {
      onSubmit: z.object({ name: z.string().trim().min(1, "Name is required.").max(60) }),
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.passkey.updatePasskey({ id, name: value.name.trim() });
      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't rename passkey",
          description: error.message ?? "Unable to rename that passkey.",
        });
        return;
      }
      setOpen(false);
      await onRenamed();
      toast.add({ type: "success", title: "Passkey renamed" });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset({ name });
      }}
    >
      <DialogTrigger render={<Button variant="outline" />}>Rename</DialogTrigger>
      <DialogContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename passkey</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <form.Field name="name">
              {(field) => <TextField field={field} label="Name" />}
            </form.Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Save
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
