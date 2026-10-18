import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";

function unwrap<T>({
  data,
  error,
}: {
  data: T | null;
  error: { message?: string; status: number } | null;
}) {
  if (error) throw new Error(error.message ?? `Request failed (${error.status})`);
  return data as T;
}

export const authConfigQueryOptions = queryOptions({
  queryKey: ["auth", "config"],
  queryFn: async () => unwrap(await authClient.config()),
  staleTime: 5 * 60_000,
});

export const accountsQueryOptions = queryOptions({
  queryKey: ["auth", "accounts"],
  queryFn: async () => unwrap(await authClient.listAccounts()),
});

export const sessionsQueryOptions = queryOptions({
  queryKey: ["auth", "sessions"],
  queryFn: async () => unwrap(await authClient.listSessions()),
});
