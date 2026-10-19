import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { SiteHeader } from "@/components/layouts/site-header";
import { isAdmin } from "@/lib/user";

export const Route = createFileRoute("/admin")({
  // The admin API enforces this server-side too; this keeps non-admins off the pages.
  beforeLoad: ({ context }) => {
    if (!isAdmin(context.user)) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader className="max-w-6xl" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
