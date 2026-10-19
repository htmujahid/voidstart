import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { SiteHeader } from "@/components/layouts/site-header";
import { ADMIN_ACCESS, userCan } from "@/lib/user";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    if (!userCan(context.user, ADMIN_ACCESS)) throw redirect({ to: "/" });
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
