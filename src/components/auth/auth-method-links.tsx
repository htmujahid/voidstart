import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useAuthConfig } from "@/hooks/use-auth-config";

export type AuthMethod = "password" | "magic-link" | "otp";

const methods = [
  { id: "password", to: "/auth/sign-in", label: "Password" },
  { id: "magic-link", to: "/auth/magic-link", label: "Magic link" },
  { id: "otp", to: "/auth/otp", label: "Email code" },
] as const;

export function AuthMethodLinks({
  current,
  redirectTo,
}: {
  current: AuthMethod;
  redirectTo?: string;
}) {
  const { emailSignIn, magicLink, emailOtp } = useAuthConfig();
  const enabled: Record<AuthMethod, boolean> = {
    password: emailSignIn,
    "magic-link": magicLink.enabled,
    otp: emailOtp.enabled,
  };
  const others = methods.filter((m) => m.id !== current && enabled[m.id]);
  if (others.length === 0) return null;

  return (
    <div className="grid auto-cols-fr grid-flow-col gap-2">
      {others.map((m) => (
        <Button
          key={m.id}
          variant="secondary"
          nativeButton={false}
          render={<Link to={m.to} search={{ redirect: redirectTo }} />}
        >
          {m.label}
        </Button>
      ))}
    </div>
  );
}
