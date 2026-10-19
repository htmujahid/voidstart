import { createFileRoute } from "@tanstack/react-router";

import { UsersTable } from "@/components/admin/users-table";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users · Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Search, filter and manage accounts. The view is kept in the URL, so you can share it.
        </p>
      </div>
      <UsersTable />
    </>
  );
}
