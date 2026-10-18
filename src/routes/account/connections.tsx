import { useEffect } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import * as z from "zod";

import { ConnectedAccounts } from "@/components/account/connected-accounts";
import { toast } from "@/components/ui/toast";
import { accountsQueryOptions, authConfigQueryOptions } from "@/lib/queries/auth";
import { humanizeCode } from "@/lib/utils";

export const Route = createFileRoute("/account/connections")({
  validateSearch: z.object({
    error: z.string().optional().catch(undefined),
    error_description: z.string().optional().catch(undefined),
  }),
  beforeLoad: async ({ context: { queryClient } }) => {
    const { account, socialProviders } = await queryClient.query(authConfigQueryOptions);
    if (!account.linking || socialProviders.length === 0) {
      throw redirect({ to: "/account/profile" });
    }
  },
  loader: ({ context: { queryClient } }) => queryClient.query(accountsQueryOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const { error, error_description } = Route.useSearch();

  useEffect(() => {
    if (!error) return;
    toast.add({
      type: "error",
      title: "Couldn't connect account",
      description: error_description ?? humanizeCode(error),
    });
  }, [error, error_description]);

  return <ConnectedAccounts />;
}
