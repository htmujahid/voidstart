import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { safeRedirect, verifyEmailCallbackURL } from "@/lib/redirect";

import { signInSchema } from "./schemas";

export function PasswordSignIn({
  redirectTo,
  onUnverified,
}: {
  redirectTo?: string;
  onUnverified: (email: string) => void;
}) {
  const router = useRouter();
  const { canResetPassword, emailVerification, username } = useAuthConfig();

  const form = useForm({
    defaultValues: { identifier: "", password: "" },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      const identifier = value.identifier.trim();
      const { password } = value;
      const isEmail = !username.enabled || identifier.includes("@");
      const callbackURL = verifyEmailCallbackURL(redirectTo);
      const { error } = isEmail
        ? await authClient.signIn.email({ email: identifier, password, callbackURL })
        : await authClient.signIn.username({ username: identifier, password, callbackURL });
      if (error?.code === "EMAIL_NOT_VERIFIED") {
        if (isEmail) onUnverified(identifier);
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

  return (
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
                  autoComplete={username.enabled ? "username" : "email"}
                  placeholder={username.enabled ? "you@example.com or username" : "you@example.com"}
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
        </Field>
      </FieldGroup>
    </form>
  );
}
