import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/auth-client";
import { safeRedirect } from "@/lib/redirect";

import { AuthCard } from "./auth-card";
import { signUpSchema } from "./schemas";
import { SocialProviders } from "./social-providers";
import { VerifyEmailNotice } from "./verify-email-notice";

export function SignUpForm({ redirectTo }: { redirectTo?: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "", confirmPassword: "" },
    validators: { onSubmit: signUpSchema },
    onSubmit: async ({ value }) => {
      const { email, password } = value;
      const { error } = await authClient.signUp.email({
        name: email.split("@")[0],
        email,
        password,
        callbackURL: safeRedirect(redirectTo),
      });
      if (error) {
        toast.add({
          type: "error",
          title: "Sign up failed",
          description: error.message ?? "Unable to create your account.",
        });
        return;
      }
      setSentTo(email);
      toast.add({
        type: "success",
        title: "Account created",
        description: "Check your email to verify your account.",
      });
    },
  });

  return (
    <AuthCard title="Create an account" description="Enter your details to get started.">
      {sentTo ? (
        <VerifyEmailNotice email={sentTo} redirectTo={redirectTo} />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <SocialProviders action="Sign up" redirectTo={redirectTo} />
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

            <form.Field name="password">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
                    <FieldDescription>Must be at least 8 characters.</FieldDescription>
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}
                    Create account
                  </Button>
                )}
              </form.Subscribe>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <Link to="/auth/sign-in" search={{ redirect: redirectTo }}>
                  Sign in
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}
