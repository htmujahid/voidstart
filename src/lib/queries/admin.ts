import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";
import { getDataTableSearchParams } from "@/lib/data-table-parsers";
import type {
  ColumnSortItem,
  DataTableColumnConfigs,
  DataTableColumnConfigsQuery,
} from "@/lib/data-table-types";

export const usersColumnConfigs = {
  name: {},
  email: { variant: "text" },
  role: { variant: "select" },
  createdAt: {},
} satisfies DataTableColumnConfigs;

const DEFAULT_SORTING: ColumnSortItem<"createdAt">[] = [{ id: "createdAt", desc: true }];

export const USERS_DEFAULT_SORTING = DEFAULT_SORTING;

export const usersSearchParams = getDataTableSearchParams({
  columnConfigs: usersColumnConfigs,
  defaultSorting: DEFAULT_SORTING,
  defaultPerPage: 10,
});

export type UsersQuery = DataTableColumnConfigsQuery<typeof usersColumnConfigs>;

async function fetchUsers({ filters, sorting, page, perPage }: UsersQuery) {
  const email = filters.find((filter) => filter.id === "email");
  const roles = [filters.find((filter) => filter.id === "role")?.value ?? []]
    .flat()
    .filter(Boolean);
  const [sort] = sorting;
  const search = typeof email?.value === "string" ? email.value.trim() : "";

  const { data, error } = await authClient.admin.listUsers({
    query: {
      limit: perPage,
      offset: (page - 1) * perPage,
      sortBy: sort?.id,
      sortDirection: sort?.desc ? "desc" : "asc",
      ...(search ? { searchField: "email", searchOperator: "contains", searchValue: search } : {}),
      ...(roles.length
        ? {
            filterField: "role",
            filterOperator: roles.length === 1 ? "eq" : "in",
            filterValue: roles.length === 1 ? roles[0] : roles,
          }
        : {}),
    },
  });
  if (error) throw new Error(error.message ?? `Request failed (${error.status})`);
  return data;
}

export type AdminUser = Awaited<ReturnType<typeof fetchUsers>>["users"][number];

export const usersKey = ["admin", "users"] as const;

export const usersQueryOptions = (query: UsersQuery) =>
  queryOptions({
    queryKey: [...usersKey, query],
    queryFn: () => fetchUsers(query),
    placeholderData: keepPreviousData,
  });

const countUsers = async (query: { filterField?: string; filterValue?: boolean | string } = {}) => {
  const { data, error } = await authClient.admin.listUsers({
    query: { limit: 1, ...query, ...(query.filterField ? { filterOperator: "eq" } : {}) },
  });
  if (error) throw new Error(error.message ?? `Request failed (${error.status})`);
  return data.total;
};

async function fetchUserStats() {
  const [total, admins, banned, unverified] = await Promise.all([
    countUsers(),
    countUsers({ filterField: "role", filterValue: "admin" }),
    countUsers({ filterField: "banned", filterValue: true }),
    countUsers({ filterField: "emailVerified", filterValue: false }),
  ]);
  return { total, admins, banned, unverified };
}

export const userStatsQueryOptions = () =>
  queryOptions({ queryKey: [...usersKey, "stats"], queryFn: fetchUserStats });
