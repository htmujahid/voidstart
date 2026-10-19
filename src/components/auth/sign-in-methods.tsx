import { useState } from "react";
import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";

import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthConfig } from "@/hooks/use-auth-config";

import { AuthCard } from "./auth-card";
import { MagicLinkSignIn } from "./magic-link-sign-in";
import { OtpSignIn } from "./otp-sign-in";
import { PasswordSignIn } from "./password-sign-in";
import { SocialProviders } from "./social-providers";
import { VerifyEmailNotice } from "./verify-email-notice";

type MethodId = "password" | "magic-link" | "otp";

interface MethodProps {
  redirectTo?: string;
  onUnverified: (email: string) => void;
}

interface Method {
  id: MethodId;
  label: string;
  component: ComponentType<MethodProps>;
}

const methods: Method[] = [
  { id: "password", label: "Password", component: PasswordSignIn },
  { id: "magic-link", label: "Magic link", component: MagicLinkSignIn },
  { id: "otp", label: "Email code", component: OtpSignIn },
];

export function SignInMethods({ redirectTo }: { redirectTo?: string }) {
  const { appName, emailSignIn, magicLink, emailOtp, canSignIn, canSignUp } = useAuthConfig();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const enabled: Record<MethodId, boolean> = {
    password: emailSignIn,
    "magic-link": magicLink.enabled,
    otp: emailOtp.enabled,
  };
  const available = methods.filter((m) => enabled[m.id]);
  const [selected, setSelected] = useState<MethodId | null>(null);
  const active = available.find((m) => m.id === selected) ?? available[0];

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
          <SocialProviders action="Sign in" redirectTo={redirectTo} showEmail={!!active} />
          {active && (
            <Tabs value={active.id} onValueChange={(value) => setSelected(value as MethodId)}>
              {available.length > 1 && (
                <TabsList className="w-full">
                  {available.map((m) => (
                    <TabsTrigger key={m.id} value={m.id}>
                      {m.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              )}
              {available.map((m) => (
                <TabsContent key={m.id} value={m.id} className="pt-2">
                  <m.component redirectTo={redirectTo} onUnverified={setUnverifiedEmail} />
                </TabsContent>
              ))}
            </Tabs>
          )}
          {canSignUp && (
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
