import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/auth-client";
import { safeRedirect } from "@/lib/redirect";

import { AuthCard } from "./auth-card";
import { signInSchema } from "./schemas";
import { SocialProviders } from "./social-providers";
import { VerifyEmailNotice } from "./verify-email-notice";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.email(value);
      if (error?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(value.email);
        toast.add({
          type: "info",
          title: "Verify your email",
          description: "We sent you a new verification link.",
        });
        return;
      }
      if (error) {
        toast.add({
          type: "error",
          title: "Sign in failed",
          description: error.message ?? "Unable to sign in.",
        });
        return;
      }
      router.history.push(safeRedirect(redirectTo));
    },
  });

  return (
    <AuthCard title="Sign in" description="Welcome back. Sign in to continue.">
      {unverifiedEmail ? (
        <VerifyEmailNotice email={unverifiedEmail} redirectTo={redirectTo} />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <SocialProviders action="Sign in" redirectTo={redirectTo} />
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
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Link
                        to="/auth/forgot-password"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="current-password"
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
                    Sign in
                  </Button>
                )}
              </form.Subscribe>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link to="/auth/sign-up" search={{ redirect: redirectTo }}>
                  Sign up
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}
