import { createFileRoute } from "@tanstack/react-router";

import { SessionsList } from "@/components/account/sessions-list";
import { sessionsQueryOptions } from "@/lib/queries/auth";

export const Route = createFileRoute("/account/sessions")({
  loader: ({ context: { queryClient } }) => queryClient.query(sessionsQueryOptions),
  component: SessionsList,
});
