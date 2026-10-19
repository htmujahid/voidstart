import { useState } from "react";
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
import { signInSchema } from "./schemas";
import { SocialProviders } from "./social-providers";
import { VerifyEmailNotice } from "./verify-email-notice";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const {
    appName,
    emailSignIn,
    canSignIn,
    canSignUp,
    canResetPassword,
    emailVerification,
    username,
  } = useAuthConfig();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { identifier: "", password: "" },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      const identifier = value.identifier.trim();
      const { password } = value;
      const { error } =
        username.enabled && !identifier.includes("@")
          ? await authClient.signIn.username({
              username: identifier,
              password,
              callbackURL: verifyEmailCallbackURL(redirectTo),
            })
          : await authClient.signIn.email({
              email: identifier,
              password,
              callbackURL: verifyEmailCallbackURL(redirectTo),
            });
      if (error?.code === "EMAIL_NOT_VERIFIED") {
        // The email is unknown when signing in by username, so verification can't be resent.
        if (!identifier.includes("@")) {
          toast.add({
            type: "info",
            title: "Verify your email",
            description: emailVerification.sendOnSignIn
              ? "We sent you a new verification link."
              : "Verify your email address to sign in.",
          });
          return;
        }
        setUnverifiedEmail(identifier);
        toast.add({
          type: "info",
          title: "Verify your email",
          description: emailVerification.sendOnSignIn
            ? "We sent you a new verification link."
            : "Verify your email address to sign in.",
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

  if (!canSignIn) {
    return (
      <AuthCard
        title="Sign in unavailable"
        description={`${appName} has no sign-in method enabled.`}
      >
        <FieldDescription className="text-center">
          Contact an administrator to get access.
        </FieldDescription>
      </AuthCard>
    );
  }

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
            <SocialProviders action="Sign in" redirectTo={redirectTo} showEmail={emailSignIn} />
            {emailSignIn && (
              <>
                <form.Field name="identifier">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          {username.enabled ? "Email or username" : "Email"}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type={username.enabled ? "text" : "email"}
                          autoComplete={username.enabled ? "username" : "email"}
                          placeholder={
                            username.enabled ? "you@example.com or username" : "you@example.com"
                          }
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
                          {canResetPassword && (
                            <Link
                              to="/auth/forgot-password"
                              className="ml-auto text-sm underline-offset-4 hover:underline"
                            >
                              Forgot password?
                            </Link>
                          )}
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
                  {canSignUp && (
                    <FieldDescription className="text-center">
                      Don&apos;t have an account?{" "}
                      <Link to="/auth/sign-up" search={{ redirect: redirectTo }}>
                        Sign up
                      </Link>
                    </FieldDescription>
                  )}
                </Field>
              </>
            )}
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}
