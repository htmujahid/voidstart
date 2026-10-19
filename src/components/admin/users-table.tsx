import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  useReactTable,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useQueryStates } from "nuqs";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useUser } from "@/hooks/use-user";
import { usersQueryOptions, type AdminUser } from "@/lib/queries/admin";

import { createUsersColumns } from "./users-columns";
import {
  PAGE_SIZES,
  SORT_FIELDS,
  usersSearchOptions,
  usersSearchParams,
  type SortField,
} from "./users-search-params";
import { UsersToolbar } from "./users-toolbar";

const NO_USERS: AdminUser[] = [];

export function UsersTable() {
  const currentUserId = useUser()?.id ?? "";
  const [params, setParams] = useQueryStates(usersSearchParams, usersSearchOptions);
  const page = Math.max(params.page, 1);
  const { data, isPending, isFetching, error } = useQuery(usersQueryOptions({ ...params, page }));
  const total = data?.total ?? 0;

  const columns = useMemo(() => createUsersColumns(currentUserId), [currentUserId]);
  const sorting: SortingState = [{ id: params.sort, desc: params.dir === "desc" }];
  const pagination: PaginationState = { pageIndex: page - 1, pageSize: params.size };

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const [next] = typeof updater === "function" ? updater(sorting) : updater;
    if (!next || !SORT_FIELDS.includes(next.id as SortField)) return;
    void setParams({ sort: next.id as SortField, dir: next.desc ? "desc" : "asc", page: 1 });
  };

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    // Changing the page size restarts from the first page.
    const sizeChanged = next.pageSize !== pagination.pageSize;
    void setParams({
      page: sizeChanged ? 1 : next.pageIndex + 1,
      size: PAGE_SIZES.find((size) => size === next.pageSize) ?? 10,
    });
  };

  // TanStack Table v8 isn't memoization-safe; `table` is only passed to unmemoized components.
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data: data?.users ?? NO_USERS,
    columns,
    getRowId: (user) => user.id,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    enableSortingRemoval: false,
    pageCount: Math.ceil(total / params.size),
    state: { sorting, pagination },
    onSortingChange,
    onPaginationChange,
  });

  return (
    <div className="flex flex-col gap-4">
      <UsersToolbar />
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          {error.message}
        </p>
      ) : (
        <DataTable
          table={table}
          loading={isPending}
          fetching={isFetching}
          emptyMessage="No users match these filters."
        />
      )}
      <DataTablePagination table={table} total={total} pageSizes={PAGE_SIZES} />
    </div>
  );
}
