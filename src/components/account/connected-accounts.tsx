import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { KeyRoundIcon } from "lucide-react";

import { getSocialProvider } from "@/components/auth/social-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { accountsQueryOptions } from "@/lib/queries/auth";

import { SettingsCard } from "./settings-card";

const CALLBACK_URL = "/account/connections";

export function ConnectedAccounts() {
  const queryClient = useQueryClient();
  const { socialProviders, account } = useAuthConfig();
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions);
  const [pending, setPending] = useState<string | null>(null);

  const linked = accounts.filter((a) => a.providerId !== "credential");
  const hasPassword = accounts.length > linked.length;
  const providerIds = [
    ...socialProviders,
    ...linked.map((a) => a.providerId).filter((id) => !socialProviders.includes(id)),
  ];
  const canUnlink = account.allowUnlinkingAll || accounts.length > 1;

  async function link(provider: string) {
    setPending(provider);
    const { error } = await authClient.linkSocial({
      provider,
      callbackURL: CALLBACK_URL,
      errorCallbackURL: CALLBACK_URL,
    });
    if (error) {
      setPending(null);
      toast.add({
        type: "error",
        title: "Couldn't connect account",
        description: error.message ?? "Unable to connect that account.",
      });
    }
  }

  async function unlink(accountId: string, provider: string) {
    setPending(provider);
    const { error } = await authClient.unlinkAccount({ accountId });
    setPending(null);
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't disconnect account",
        description: error.message ?? "Unable to disconnect that account.",
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: accountsQueryOptions.queryKey });
    toast.add({ type: "success", title: "Account disconnected" });
  }

  return (
    <SettingsCard
      title="Connected accounts"
      description="Sign in with these providers in addition to your email."
    >
      <div className="-my-2 divide-y">
        {hasPassword && (
          <Item className="px-0">
            <ItemMedia variant="icon">
              <KeyRoundIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Email and password</ItemTitle>
              <ItemDescription>Sign in with your email address.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge variant="secondary">Connected</Badge>
            </ItemActions>
          </Item>
        )}
        {providerIds.map((id) => {
          const { name, icon: Icon } = getSocialProvider(id);
          const connected = linked.find((a) => a.providerId === id);
          return (
            <Item key={id} className="px-0">
              <ItemMedia variant="icon">
                <Icon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{name}</ItemTitle>
                <ItemDescription>{connected ? "Connected" : "Not connected"}</ItemDescription>
              </ItemContent>
              <ItemActions>
                {connected ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending !== null || !canUnlink}
                    title={canUnlink ? undefined : "You can't disconnect your only sign-in method."}
                    onClick={() => unlink(connected.id, id)}
                  >
                    {pending === id && <Spinner />}
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={pending !== null || !socialProviders.includes(id)}
                    onClick={() => link(id)}
                  >
                    {pending === id && <Spinner />}
                    Connect
                  </Button>
                )}
              </ItemActions>
            </Item>
          );
        })}
      </div>
    </SettingsCard>
  );
}
