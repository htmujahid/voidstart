import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";

export interface UsersParams {
  q: string;
  in: "email" | "name";
  filter: "admin" | "user" | "banned" | null;
  sort: "createdAt" | "name" | "email" | "role";
  dir: "asc" | "desc";
  page: number;
  size: number;
}

async function fetchUsers(params: UsersParams) {
  const { q, filter, size } = params;
  const { data, error } = await authClient.admin.listUsers({
    query: {
      searchValue: q || undefined,
      searchField: params.in,
      searchOperator: "contains",
      sortBy: params.sort,
      sortDirection: params.dir,
      limit: size,
      offset: (Math.max(params.page, 1) - 1) * size,
      ...(filter === "banned"
        ? { filterField: "banned", filterValue: true, filterOperator: "eq" }
        : filter
          ? { filterField: "role", filterValue: filter, filterOperator: "eq" }
          : {}),
    },
  });
  if (error) throw new Error(error.message ?? `Request failed (${error.status})`);
  return data;
}

export type AdminUser = Awaited<ReturnType<typeof fetchUsers>>["users"][number];

export const usersKey = ["admin", "users"] as const;

export const usersQueryOptions = (params: UsersParams) =>
  queryOptions({
    queryKey: [...usersKey, params],
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
  });
