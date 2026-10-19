import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { FieldDescription } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth/auth-client";
import { formatDuration } from "@/lib/duration";
import { accountsQueryOptions, sessionsQueryOptions } from "@/lib/queries/auth";

import { BackupCodes } from "./backup-codes";
import { EnableTwoFactorDialog } from "./enable-two-factor-dialog";
import { PasswordDialog } from "./password-dialog";
import { SettingsCard } from "./settings-card";
import { TotpSetup } from "./totp-setup";

export function TwoFactorCard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const user = useUser();
  const { twoFactor } = useAuthConfig();
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions);
  const hasPassword = accounts.some((account) => account.providerId === "credential");
  const enabled = user?.twoFactorEnabled ?? false;

  if (!twoFactor.enabled) return null;

  if (!hasPassword && !twoFactor.allowPasswordless) {
    return (
      <SettingsCard
        title="Two-factor authentication"
        description="Set a password before you can manage two-factor authentication."
      />
    );
  }

  const refresh = () =>
    Promise.all([
      router.invalidate(),
      queryClient.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey }),
    ]);

  if (!enabled) {
    return (
      <SettingsCard
        title="Two-factor authentication"
        description="Protect your account with a second step when you sign in with a password."
        footer={<EnableTwoFactorDialog requiresPassword={hasPassword} />}
      >
        <FieldDescription>
          Codes come from an authenticator app
          {twoFactor.otp.enabled ? " or your email" : ""}, with backup codes as a fallback. This
          applies to password sign-in; magic link, email code and social sign-in are unaffected.
        </FieldDescription>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard
      title="Two-factor authentication"
      description="A second step is required when you sign in with a password."
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">Enabled</Badge>
          <span className="text-muted-foreground">
            Trusted devices skip this step for {formatDuration(twoFactor.trustDeviceMaxAge)}.
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {twoFactor.totp.enabled && (
            <PasswordDialog
              trigger="Show setup key"
              title="Authenticator app"
              description="Use this to add your account to another authenticator app."
              confirmLabel="Show"
              requiresPassword={hasPassword}
              onSubmit={async (password) => {
                const { data, error } = await authClient.twoFactor.getTotpUri({
                  password: password ?? "",
                });
                if (error || !data) {
                  toast.add({
                    type: "error",
                    title: "Couldn't load setup key",
                    description: error?.message ?? "Authenticator app isn't set up.",
                  });
                  return null;
                }
                return { result: <TotpSetup uri={data.totpURI} /> };
              }}
            />
          )}
          <PasswordDialog
            trigger="Regenerate backup codes"
            title="Regenerate backup codes"
            description={`This creates ${twoFactor.backupCodes.amount} new codes and invalidates your old ones.`}
            confirmLabel="Regenerate"
            requiresPassword={hasPassword}
            onSubmit={async (password) => {
              const { data, error } = await authClient.twoFactor.generateBackupCodes({
                password: password ?? "",
              });
              if (error || !data) {
                toast.add({
                  type: "error",
                  title: "Couldn't regenerate backup codes",
                  description: error?.message ?? "Unable to create new backup codes.",
                });
                return null;
              }
              return { result: <BackupCodes codes={data.backupCodes} /> };
            }}
          />
          <PasswordDialog
            trigger="Disable"
            triggerVariant="destructive"
            title="Disable two-factor authentication?"
            description="Your account will be protected by your password alone."
            confirmLabel="Disable"
            destructive
            requiresPassword={hasPassword}
            onSubmit={async (password) => {
              const { error } = await authClient.twoFactor.disable({
                password: password ?? "",
              });
              if (error) {
                toast.add({
                  type: "error",
                  title: "Couldn't disable two-factor authentication",
                  description: error.message ?? "Unable to disable two-factor authentication.",
                });
                return null;
              }
              await refresh();
              toast.add({ type: "success", title: "Two-factor authentication disabled" });
              return {};
            }}
          />
        </div>
      </div>
    </SettingsCard>
  );
}
