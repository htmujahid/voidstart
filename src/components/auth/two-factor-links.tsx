import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { twoFactorPaths } from "@/lib/auth/two-factor";

export type TwoFactorMethod = "totp" | "otp" | "backup-code";

const methods = [
  { id: "totp", to: twoFactorPaths.totp, label: "Authenticator app" },
  { id: "otp", to: twoFactorPaths.otp, label: "Email code" },
  { id: "backup-code", to: twoFactorPaths.backupCode, label: "Backup code" },
] as const;

export function TwoFactorLinks({
  current,
  redirectTo,
}: {
  current: TwoFactorMethod;
  redirectTo?: string;
}) {
  const { twoFactor } = useAuthConfig();
  const enabled: Record<TwoFactorMethod, boolean> = {
    totp: twoFactor.totp.enabled,
    otp: twoFactor.otp.enabled,
    "backup-code": true,
  };
  const others = methods.filter((m) => m.id !== current && enabled[m.id]);

  return (
    <>
      {others.length > 0 && (
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
      )}
      <FieldDescription className="text-center">
        <Link to="/auth/sign-in" search={{ redirect: redirectTo }}>
          Back to sign in
        </Link>
      </FieldDescription>
    </>
  );
}
