import { useEffect, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";

import { AuthCard } from "./auth-card";
import { AuthNotice } from "./auth-notice";
import { createResetPasswordSchema } from "./schemas";

export function ResetPasswordForm({ token, invalid }: { token?: string; invalid?: boolean }) {
  const navigate = useNavigate();
  const { canResetPassword, emailAndPassword } = useAuthConfig();
  const { minPasswordLength, maxPasswordLength } = emailAndPassword;
  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema({ minPasswordLength, maxPasswordLength }),
    [minPasswordLength, maxPasswordLength],
  );

  useEffect(() => {
    if (!canResetPassword || (token && !invalid)) return;
    toast.add({
      type: "error",
      title: "Invalid reset link",
      description: "This link is invalid or has expired. Request a new one.",
    });
    void navigate({ to: "/auth/forgot-password" });
  }, [token, invalid, canResetPassword, navigate]);

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      if (!token || invalid) return;
      const { error } = await authClient.resetPassword({
        newPassword: value.password,
        token,
      });
      if (error) {
        toast.add({
          type: "error",
          title: "Reset failed",
          description: error.message ?? "Unable to reset your password.",
        });
        return;
      }
      toast.add({
        type: "success",
        title: "Password updated",
        description: "Sign in with your new password.",
      });
      await navigate({ to: "/auth/sign-in" });
    },
  });

  if (!canResetPassword) {
    return (
      <AuthNotice
        title="Password reset unavailable"
        description="Resetting passwords by email isn't enabled."
      />
    );
  }

  return (
    <AuthCard title="Reset password" description="Choose a new password for your account.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Field>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting || !token || invalid}>
                  {isSubmitting && <Spinner />}
                  Reset password
                </Button>
              )}
            </form.Subscribe>
            <FieldDescription className="text-center">
              <Link to="/auth/forgot-password">Request a new link</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
