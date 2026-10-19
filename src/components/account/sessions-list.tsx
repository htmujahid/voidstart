import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { LaptopIcon } from "lucide-react";

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
import { useSignOut } from "@/hooks/use-sign-out";
import { authClient } from "@/lib/auth/auth-client";
import { sessionsQueryOptions } from "@/lib/queries/auth";
import { describeUserAgent } from "@/lib/user-agent";

import { SettingsCard } from "./settings-card";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

interface Device {
  key: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  signedInAt: Date;
  tokens: string[];
  current: boolean;
}

export function SessionsList() {
  const queryClient = useQueryClient();
  const signOut = useSignOut();
  const currentId = useRouteContext({ from: "__root__", select: (ctx) => ctx.session?.id });
  const { data: sessions } = useSuspenseQuery(sessionsQueryOptions);
  const [pending, setPending] = useState<string | null>(null);

  const devices = Object.values(
    sessions.reduce<Record<string, Device>>((acc, session) => {
      const key = `${session.userAgent ?? ""}|${session.ipAddress ?? ""}`;
      const createdAt = new Date(session.createdAt);
      const device = (acc[key] ??= {
        key,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        signedInAt: createdAt,
        tokens: [],
        current: false,
      });
      device.tokens.push(session.token);
      device.current ||= session.id === currentId;
      if (createdAt > device.signedInAt) device.signedInAt = createdAt;
      return acc;
    }, {}),
  );
  const hasOthers = sessions.some((s) => s.id !== currentId);

  function fail(title: string, description: string) {
    toast.add({ type: "error", title, description });
  }

  async function revokeDevice(device: Device) {
    setPending(device.key);
    const tokens = device.current
      ? device.tokens.filter((token) => token !== currentToken())
      : device.tokens;
    const results = await Promise.all(tokens.map((token) => authClient.revokeSession({ token })));
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      setPending(null);
      fail("Couldn't revoke session", failed.error.message ?? "Unable to revoke that session.");
      return;
    }
    if (device.current) {
      await signOut();
      return;
    }
    setPending(null);
    await queryClient.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey });
    toast.add({ type: "success", title: "Session revoked" });
  }

  function currentToken() {
    return sessions.find((s) => s.id === currentId)?.token;
  }

  async function revokeOthers() {
    setPending("others");
    const { error } = await authClient.revokeOtherSessions();
    setPending(null);
    if (error) {
      fail("Couldn't revoke sessions", error.message ?? "Unable to revoke your other sessions.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey });
    toast.add({ type: "success", title: "Other sessions revoked" });
  }

  return (
    <SettingsCard
      title="Active sessions"
      description="Devices where you're currently signed in."
      footer={
        hasOthers && (
          <Button
            type="button"
            variant="outline"
            disabled={pending !== null}
            onClick={revokeOthers}
          >
            {pending === "others" && <Spinner />}
            Revoke all other sessions
          </Button>
        )
      }
    >
      <div className="-my-2 divide-y">
        {devices.map((device) => (
          <Item key={device.key} className="px-0">
            <ItemMedia variant="icon">
              <LaptopIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {describeUserAgent(device.userAgent)}
                {device.current && <Badge variant="secondary">This device</Badge>}
              </ItemTitle>
              <ItemDescription>
                {device.ipAddress ? `${device.ipAddress} · ` : ""}
                Signed in {dateFormat.format(device.signedInAt)}
                {device.tokens.length > 1 ? ` · ${device.tokens.length} sessions` : ""}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                type="button"
                variant="outline"
                disabled={pending !== null}
                onClick={() => revokeDevice(device)}
              >
                {pending === device.key && <Spinner />}
                {device.current ? "Sign out" : "Revoke"}
              </Button>
            </ItemActions>
          </Item>
        ))}
      </div>
    </SettingsCard>
  );
}
