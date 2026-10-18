import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";

export const authConfigQueryOptions = queryOptions({
  queryKey: ["auth", "config"],
  queryFn: async () => {
    const { data, error } = await authClient.config();
    if (error) throw new Error(error.message ?? `Failed to load auth config (${error.status})`);
    return data;
  },
  staleTime: 5 * 60_000,
});
