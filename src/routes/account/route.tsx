import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AccountNav } from "@/components/account/account-nav";
import { SiteHeader } from "@/components/layouts/site-header";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

function AccountLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:flex-row md:gap-10 md:px-6">
        <AccountNav />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
