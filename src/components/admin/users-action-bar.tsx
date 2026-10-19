import { useState } from "react";
import type { ReactTable } from "@tanstack/react-table";
import { LogOutIcon, XIcon } from "lucide-react";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/components/ui/action-bar";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { getVisibleSelectedRows } from "@/lib/data-table-utils";
import type { AdminUser } from "@/lib/queries/admin";

import { useAdminAction } from "./use-admin-action";

type UsersTable = ReactTable<DataTableFeatures, AdminUser, unknown>;

interface UsersActionBarProps {
  table: UsersTable;
  currentUserId: string;
}

export function UsersActionBar(props: UsersActionBarProps) {
  return (
    <props.table.Subscribe selector={(state) => state.rowSelection}>
      {() => <UsersActionBarContent {...props} />}
    </props.table.Subscribe>
  );
}

function UsersActionBarContent({ table, currentUserId }: UsersActionBarProps) {
  const run = useAdminAction();
  const [pending, setPending] = useState(false);

  const selected = getVisibleSelectedRows(table);
  const ids = selected.map((row) => row.original.id).filter((id) => id !== currentUserId);
  const excludesSelf = ids.length < selected.length;

  async function revokeSessions() {
    setPending(true);
    const ok = await run(
      async () => {
        const results = await Promise.all(
          ids.map((userId) => authClient.admin.revokeUserSessions({ userId })),
        );
        return { error: results.find((result) => result.error)?.error ?? null };
      },
      "Sessions revoked",
      "Couldn't revoke sessions",
    );
    setPending(false);
    if (ok) table.resetRowSelection();
  }

  return (
    <ActionBar
      open={selected.length > 0}
      onOpenChange={(open) => {
        if (!open) table.resetRowSelection();
      }}
    >
      <ActionBarSelection>
        {selected.length} selected
        {excludesSelf && <span className="font-normal text-muted-foreground">· excluding you</span>}
      </ActionBarSelection>
      <ActionBarSeparator />
      <ActionBarGroup>
        <ActionBarItem
          variant="secondary"
          size="sm"
          disabled={ids.length === 0 || pending}
          onSelect={(event) => {
            event.preventDefault();
            void revokeSessions();
          }}
        >
          {pending ? <Spinner /> : <LogOutIcon />}
          Revoke sessions
        </ActionBarItem>
      </ActionBarGroup>
      <ActionBarSeparator />
      <ActionBarClose aria-label="Clear selection">
        <XIcon />
      </ActionBarClose>
    </ActionBar>
  );
}
