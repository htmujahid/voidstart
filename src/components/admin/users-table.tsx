import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useUser } from "@/hooks/use-user";
import { getDataTableQuery } from "@/lib/data-table-parsers";
import {
  USERS_DEFAULT_SORTING,
  usersColumnConfigs,
  usersQueryOptions,
  usersSearchParams,
  type AdminUser,
} from "@/lib/queries/admin";

import { UserRowActionDialogs } from "./user-row-action-dialogs";
import type { UserRowAction } from "./user-row-actions";
import { UsersActionBar } from "./users-action-bar";
import { createUsersColumns } from "./users-columns";

const NO_USERS: AdminUser[] = [];

export function UsersTable() {
  const currentUserId = useUser()?.id ?? "";
  const [rowAction, setRowAction] = useState<UserRowAction | null>(null);

  const [search] = useQueryStates(usersSearchParams);
  const query = getDataTableQuery(search, usersColumnConfigs);
  const { data, isPending, error } = useQuery(usersQueryOptions(query));

  const columns = useMemo(
    () => createUsersColumns({ currentUserId, onRowAction: setRowAction }),
    [currentUserId],
  );

  const { table } = useDataTable({
    data: data?.users ?? NO_USERS,
    columns,
    pageCount: Math.ceil((data?.total ?? 0) / query.perPage),
    initialState: {
      sorting: USERS_DEFAULT_SORTING,
      pagination: { pageIndex: 0, pageSize: 10 },
      columnPinning: { start: ["select"], end: ["actions"] },
    },
    getRowId: (user) => user.id,
    enableMultiSort: false,
    history: "push",
    clearOnDefault: true,
  });

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
      >
        {error.message}
      </p>
    );
  }

  if (isPending) {
    return <DataTableSkeleton columnCount={columns.length} filterCount={2} />;
  }

  return (
    <>
      <DataTable
        table={table}
        className="overflow-visible gap-3 [&_[data-slot=data-table-pagination]]:overflow-visible [&_[data-slot=data-table-pagination]]:px-0"
        actionBar={<UsersActionBar table={table} currentUserId={currentUserId} />}
      >
        <DataTableToolbar table={table} className="p-0" />
      </DataTable>
      <UserRowActionDialogs action={rowAction} onClose={() => setRowAction(null)} />
    </>
  );
}
