import { useState } from "react";
import type { ReactTable } from "@tanstack/react-table";
import { LogOutIcon, Trash2Icon, XIcon } from "lucide-react";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/components/ui/action-bar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { getVisibleSelectedRows } from "@/lib/data-table-utils";
import type { AdminUser } from "@/lib/queries/admin";

import { useAdminAction } from "./user-actions";

type UsersTable = ReactTable<DataTableFeatures, AdminUser, unknown>;
type BulkAction = "revoke" | "delete";
type ApiResult = { error: { message?: string } | null };

interface UsersActionBarProps {
  table: UsersTable;
  currentUserId: string;
}

/** Floating bar for the selected rows. Re-renders whenever the selection changes. */
export function UsersActionBar(props: UsersActionBarProps) {
  return (
    <props.table.Subscribe selector={(state) => state.rowSelection}>
      {() => <UsersActionBarContent {...props} />}
    </props.table.Subscribe>
  );
}

function UsersActionBarContent({ table, currentUserId }: UsersActionBarProps) {
  const run = useAdminAction();
  const [pending, setPending] = useState<BulkAction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selected = getVisibleSelectedRows(table);
  // The signed-in admin can be selected but is never acted on.
  const ids = selected.map((row) => row.original.id).filter((id) => id !== currentUserId);
  const excludesSelf = ids.length < selected.length;

  async function runBulk(
    action: BulkAction,
    call: (userId: string) => Promise<ApiResult>,
    success: string,
    failure: string,
  ) {
    setPending(action);
    const ok = await run(
      async () => {
        const results = await Promise.all(ids.map(call));
        return { error: results.find((result) => result.error)?.error ?? null };
      },
      success,
      failure,
    );
    setPending(null);
    if (ok) table.resetRowSelection();
  }

  const busy = pending !== null;

  return (
    <>
      <ActionBar
        open={selected.length > 0}
        // Escape and the close button clear the selection, unless a dialog owns Escape.
        onOpenChange={(open) => {
          if (!open && !confirmDelete) table.resetRowSelection();
        }}
      >
        <ActionBarSelection>
          {selected.length} selected
          {excludesSelf && (
            <span className="font-normal text-muted-foreground">· excluding you</span>
          )}
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem
            variant="secondary"
            size="sm"
            disabled={ids.length === 0 || busy}
            onSelect={(event) => {
              // Keep the selection; it's cleared only once the action succeeds.
              event.preventDefault();
              void runBulk(
                "revoke",
                (userId) => authClient.admin.revokeUserSessions({ userId }),
                "Sessions revoked",
                "Couldn't revoke sessions",
              );
            }}
          >
            {pending === "revoke" ? <Spinner /> : <LogOutIcon />}
            Revoke sessions
          </ActionBarItem>
          <ActionBarItem
            variant="destructive"
            size="sm"
            disabled={ids.length === 0 || busy}
            onSelect={(event) => {
              event.preventDefault();
              setConfirmDelete(true);
            }}
          >
            {pending === "delete" ? <Spinner /> : <Trash2Icon />}
            Delete
          </ActionBarItem>
        </ActionBarGroup>
        <ActionBarSeparator />
        <ActionBarClose aria-label="Clear selection">
          <XIcon />
        </ActionBarClose>
      </ActionBar>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {ids.length} {ids.length === 1 ? "user" : "users"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes their accounts, connections and sessions. It can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                void runBulk(
                  "delete",
                  (userId) => authClient.admin.removeUser({ userId }),
                  "Users deleted",
                  "Couldn't delete users",
                )
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
