import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { safeRedirect, verifyEmailCallbackURL } from "@/lib/redirect";

import { AuthCard } from "./auth-card";
import { AuthMethodLinks } from "./auth-method-links";
import { AuthNotice } from "./auth-notice";
import { createSignUpSchema } from "./schemas";
import { SocialProviders } from "./social-providers";
import { VerifyEmailNotice } from "./verify-email-notice";

export function SignUpForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { appName, emailAndPassword, emailSignUp, canSignUp } = useAuthConfig();
  const { minPasswordLength, maxPasswordLength, requireEmailVerification, autoSignIn } =
    emailAndPassword;
  const signUpSchema = useMemo(
    () => createSignUpSchema({ minPasswordLength, maxPasswordLength }),
    [minPasswordLength, maxPasswordLength],
  );

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: signUpSchema },
    onSubmit: async ({ value }) => {
      const { email, password } = value;
      const { error } = await authClient.signUp.email({
        name: "",
        email,
        password,
        callbackURL: verifyEmailCallbackURL(redirectTo),
      });
      if (error) {
        toast.add({
          type: "error",
          title: "Sign up failed",
          description: error.message ?? "Unable to create your account.",
        });
        return;
      }
      if (requireEmailVerification) {
        setSentTo(email);
        toast.add({
          type: "success",
          title: "Account created",
          description: "Check your email to verify your account.",
        });
        return;
      }
      if (autoSignIn) {
        router.history.push(safeRedirect(redirectTo));
        return;
      }
      toast.add({
        type: "success",
        title: "Account created",
        description: "Sign in to continue.",
      });
      await router.navigate({ to: "/auth/sign-in", search: { redirect: redirectTo } });
    },
  });

  if (!canSignUp) {
    return (
      <AuthNotice
        title="Sign up is disabled"
        description={`New accounts can't be created on ${appName} right now.`}
        redirectTo={redirectTo}
      />
    );
  }

  return (
    <AuthCard title="Create an account" description="Enter your details to get started.">
      {sentTo ? (
        <VerifyEmailNotice email={sentTo} redirectTo={redirectTo} />
      ) : (
        <FieldGroup>
          <SocialProviders redirectTo={redirectTo} showEmail={emailSignUp} />
          {emailSignUp && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
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
                  <AuthMethodLinks current="password" redirectTo={redirectTo} />
                </Field>
              </FieldGroup>
            </form>
          )}
          {!emailSignUp && <AuthMethodLinks current="password" redirectTo={redirectTo} />}
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link to="/auth/sign-in" search={{ redirect: redirectTo }}>
              Sign in
            </Link>
          </FieldDescription>
        </FieldGroup>
      )}
    </AuthCard>
  );
}
