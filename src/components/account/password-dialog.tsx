import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "@tanstack/react-form";

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

import { TextField } from "./text-field";

export type PasswordDialogResult = { result?: ReactNode } | null;

export function PasswordDialog({
  trigger,
  triggerVariant = "outline",
  title,
  description,
  confirmLabel,
  destructive,
  requiresPassword,
  onSubmit,
  onClosed,
}: {
  trigger: string;
  triggerVariant?: "outline" | "destructive";
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  requiresPassword: boolean;
  onSubmit: (password: string | undefined) => Promise<PasswordDialogResult>;
  onClosed?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ReactNode>(null);

  const form = useForm({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      const outcome = await onSubmit(requiresPassword ? value.password : undefined);
      if (!outcome) return;
      if (outcome.result) {
        setResult(outcome.result);
        return;
      }
      close();
    },
  });

  function close() {
    setOpen(false);
    setResult(null);
    form.reset();
    onClosed?.();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogTrigger render={<Button variant={triggerVariant} />}>{trigger}</DialogTrigger>
      <DialogContent>
        {result ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            {result}
            <DialogFooter>
              <Button type="button" onClick={close}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {requiresPassword && (
              <FieldGroup>
                <form.Field
                  name="password"
                  validators={{
                    onSubmit: ({ value }) => (value ? undefined : "Password is required."),
                  }}
                >
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
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    variant={destructive ? "destructive" : "default"}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Spinner />}
                    {confirmLabel}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
