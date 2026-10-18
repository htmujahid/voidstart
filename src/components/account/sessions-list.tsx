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
import { authClient } from "@/lib/auth/auth-client";
import { sessionsQueryOptions } from "@/lib/queries/auth";
import { describeUserAgent } from "@/lib/user-agent";

import { SettingsCard } from "./settings-card";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export function SessionsList() {
  const queryClient = useQueryClient();
  const currentId = useRouteContext({ from: "__root__", select: (ctx) => ctx.session?.id });
  const { data: sessions } = useSuspenseQuery(sessionsQueryOptions);
  const [pending, setPending] = useState<string | null>(null);

  const others = sessions.filter((s) => s.id !== currentId);

  async function revoke(token: string) {
    setPending(token);
    const { error } = await authClient.revokeSession({ token });
    setPending(null);
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't sign out device",
        description: error.message ?? "Unable to revoke that session.",
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey });
  }

  async function revokeOthers() {
    setPending("others");
    const { error } = await authClient.revokeOtherSessions();
    setPending(null);
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't sign out devices",
        description: error.message ?? "Unable to revoke your other sessions.",
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey });
    toast.add({ type: "success", title: "Signed out of other devices" });
  }

  return (
    <SettingsCard
      title="Active sessions"
      description="Devices where you're currently signed in."
      footer={
        others.length > 0 && (
          <Button
            type="button"
            variant="outline"
            disabled={pending !== null}
            onClick={revokeOthers}
          >
            {pending === "others" && <Spinner />}
            Sign out other devices
          </Button>
        )
      }
    >
      <div className="-my-2 divide-y">
        {sessions.map((session) => (
          <Item key={session.id} className="px-0">
            <ItemMedia variant="icon">
              <LaptopIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {describeUserAgent(session.userAgent)}
                {session.id === currentId && <Badge variant="secondary">This device</Badge>}
              </ItemTitle>
              <ItemDescription>
                {session.ipAddress ? `${session.ipAddress} · ` : ""}
                Signed in {dateFormat.format(new Date(session.createdAt))}
              </ItemDescription>
            </ItemContent>
            {session.id !== currentId && (
              <ItemActions>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending !== null}
                  onClick={() => revoke(session.token)}
                >
                  {pending === session.token && <Spinner />}
                  Sign out
                </Button>
              </ItemActions>
            )}
          </Item>
        ))}
      </div>
    </SettingsCard>
  );
}
