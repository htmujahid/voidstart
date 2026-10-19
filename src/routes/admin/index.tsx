import { createFileRoute } from "@tanstack/react-router";
import { createLoader } from "nuqs";

import { UserStats } from "@/components/admin/user-stats";
import { UsersTable } from "@/components/admin/users-table";
import { getDataTableQuery } from "@/lib/data-table-parsers";
import {
  userStatsQueryOptions,
  usersColumnConfigs,
  usersQueryOptions,
  usersSearchParams,
} from "@/lib/queries/admin";

const noop = () => {};
const loadUsersSearch = createLoader(usersSearchParams);

export const Route = createFileRoute("/admin/")({
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context: { queryClient }, location }) => {
    const query = getDataTableQuery(loadUsersSearch(location.searchStr), usersColumnConfigs);
    await Promise.all([
      queryClient.query(usersQueryOptions(query)).catch(noop),
      queryClient.query(userStatsQueryOptions()).catch(noop),
    ]);
  },
  head: () => ({ meta: [{ title: "Admin" }] }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <>
      <UserStats />
      <UsersTable />
    </>
  );
}
