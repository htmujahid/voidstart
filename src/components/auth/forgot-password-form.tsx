import { Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { auth } from "void/client/react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { AuthCard } from "./auth-card";
import { forgotPasswordSchema } from "./schemas";

export function ForgotPasswordForm() {
  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      const { error } = await auth.requestPasswordReset({
        email: value.email,
        redirectTo: "/auth/reset-password",
      });
      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't send reset link",
          description: error.message ?? "Unable to send the reset link.",
        });
        return;
      }
      toast.add({
        type: "success",
        title: "Check your email",
        description: `If an account exists for ${value.email}, a reset link is on its way.`,
      });
      form.reset();
    },
  });

  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email and we'll send you a reset link."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Send reset link
                </Button>
              )}
            </form.Subscribe>
            <FieldDescription className="text-center">
              Remembered it? <Link to="/auth/sign-in">Sign in</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
