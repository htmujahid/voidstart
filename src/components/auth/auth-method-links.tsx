import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { loginMethods } from "@/lib/auth/login-methods";
import { usePasskeySupported } from "@/lib/auth/passkey";

import { LastUsedBadge } from "./last-used-badge";
import { PasskeySignInButton } from "./passkey-sign-in-button";

export type AuthMethod = "password" | "magic-link" | "otp";

const methods = [
  { id: "password", to: "/auth/sign-in", label: "Password", method: loginMethods.password },
  { id: "magic-link", to: "/auth/magic-link", label: "Magic link", method: loginMethods.magicLink },
  { id: "otp", to: "/auth/otp", label: "Email code", method: loginMethods.emailOtp },
] as const;

export function AuthMethodLinks({
  current,
  redirectTo,
}: {
  current: AuthMethod;
  redirectTo?: string;
}) {
  const { emailSignIn, magicLink, emailOtp, passkey } = useAuthConfig();
  const passkeySupported = usePasskeySupported();
  const enabled: Record<AuthMethod, boolean> = {
    password: emailSignIn,
    "magic-link": magicLink.enabled,
    otp: emailOtp.enabled,
  };
  const others = methods.filter((m) => m.id !== current && enabled[m.id]);
  const showPasskey = passkey.enabled && passkeySupported;
  if (others.length === 0 && !showPasskey) return null;

  return (
    <div className="grid auto-cols-fr grid-flow-col gap-2">
      {others.map((m) => (
        <Button
          key={m.id}
          variant="secondary"
          className="relative"
          nativeButton={false}
          render={<Link to={m.to} search={{ redirect: redirectTo }} />}
        >
          {m.label}
          <LastUsedBadge method={m.method} />
        </Button>
      ))}
      <PasskeySignInButton redirectTo={redirectTo} />
    </div>
  );
}
