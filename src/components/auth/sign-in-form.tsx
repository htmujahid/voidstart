import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { usePasskeyAutofill } from "@/hooks/use-passkey-autofill";
import { authClient } from "@/lib/auth/auth-client";
import { loginMethods } from "@/lib/auth/login-methods";
import { isTwoFactorRedirect, twoFactorPath } from "@/lib/auth/two-factor";
import { safeRedirect, verifyEmailCallbackURL } from "@/lib/redirect";

import { AuthCard } from "./auth-card";
import { AuthMethodLinks } from "./auth-method-links";
import { LastUsedBadge } from "./last-used-badge";
import { signInSchema } from "./schemas";
import { SocialProviders } from "./social-providers";
import { VerifyEmailNotice } from "./verify-email-notice";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const {
    appName,
    emailSignIn,
    emailSignUp,
    canSignIn,
    canResetPassword,
    emailVerification,
    username,
  } = useAuthConfig();
  usePasskeyAutofill(redirectTo);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { identifier: "", password: "" },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      const identifier = value.identifier.trim();
      const { password } = value;
      const isEmail = !username.enabled || identifier.includes("@");
      const callbackURL = verifyEmailCallbackURL(redirectTo);
      const { data, error } = isEmail
        ? await authClient.signIn.email({ email: identifier, password, callbackURL })
        : await authClient.signIn.username({ username: identifier, password, callbackURL });
      if (error?.code === "EMAIL_NOT_VERIFIED") {
        if (isEmail) setUnverifiedEmail(identifier);
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
      if (isTwoFactorRedirect(data)) {
        await router.navigate({
          to: twoFactorPath(data.twoFactorMethods),
          search: { redirect: redirectTo },
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
        <FieldGroup>
          <SocialProviders redirectTo={redirectTo} showEmail={emailSignIn} />
          {emailSignIn && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
              }}
            >
              <FieldGroup>
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
                          autoComplete={username.enabled ? "username webauthn" : "email webauthn"}
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
                      <Button type="submit" className="relative" disabled={isSubmitting}>
                        {isSubmitting && <Spinner />}
                        Sign in
                        <LastUsedBadge method={loginMethods.password} />
                      </Button>
                    )}
                  </form.Subscribe>
                  <AuthMethodLinks current="password" redirectTo={redirectTo} />
                </Field>
              </FieldGroup>
            </form>
          )}
          {!emailSignIn && <AuthMethodLinks current="password" redirectTo={redirectTo} />}
          {emailSignUp && (
            <FieldDescription className="text-center">
              Don&apos;t have an account?{" "}
              <Link to="/auth/sign-up" search={{ redirect: redirectTo }}>
                Sign up
              </Link>
            </FieldDescription>
          )}
        </FieldGroup>
      )}
    </AuthCard>
  );
}
