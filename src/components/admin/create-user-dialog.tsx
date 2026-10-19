import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { UserPlusIcon } from "lucide-react";

import { TextField } from "@/components/account/text-field";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth/auth-client";

import { useAdminAction } from "./use-admin-action";

const ROLES = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

const defaultValues = {
  name: "",
  email: "",
  password: "",
  role: "user",
  emailVerified: true,
};

export function CreateUserDialog() {
  const run = useAdminAction();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const ok = await run(
        () =>
          authClient.admin.createUser({
            name: value.name.trim(),
            email: value.email.trim(),
            password: value.password,
            role: value.role as "user" | "admin",
            data: { emailVerified: value.emailVerified },
          }),
        "User created",
        "Couldn't create user",
      );
      if (ok) close();
    },
  });

  function close() {
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogTrigger render={<Button />}>
        <UserPlusIcon />
        Add user
      </DialogTrigger>
      <DialogContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Create an account with a password. Share the credentials with the user.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <form.Field
              name="name"
              validators={{
                onSubmit: ({ value }) => (value.trim() ? undefined : "Name is required."),
              }}
            >
              {(field) => <TextField field={field} label="Name" autoComplete="off" />}
            </form.Field>
            <form.Field
              name="email"
              validators={{
                onSubmit: ({ value }) =>
                  /^\S+@\S+\.\S+$/.test(value.trim()) ? undefined : "Enter a valid email address.",
              }}
            >
              {(field) => <TextField field={field} label="Email" type="email" autoComplete="off" />}
            </form.Field>
            <form.Field
              name="password"
              validators={{
                onSubmit: ({ value }) =>
                  value.length >= 8 ? undefined : "Password must be at least 8 characters.",
              }}
            >
              {(field) => (
                <TextField
                  field={field}
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                />
              )}
            </form.Field>
            <form.Field name="role">
              {(field) => (
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => value && field.handleChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
            <form.Field name="emailVerified">
              {(field) => (
                <Field orientation="horizontal">
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                  <div className="flex flex-col gap-1">
                    <FieldLabel htmlFor={field.name}>Mark email as verified</FieldLabel>
                    <FieldDescription>
                      Otherwise the user must verify their email before signing in.
                    </FieldDescription>
                  </div>
                </Field>
              )}
            </form.Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Create user
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
