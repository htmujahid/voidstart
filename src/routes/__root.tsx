import { Suspense, lazy } from "react";
import { Outlet, createRootRouteWithContext, redirect } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

import { Toaster } from "@/components/ui/toast";
import "../styles.css";

const Devtools = import.meta.env.DEV
  ? lazy(() => import("@/components/devtools").then((m) => ({ default: m.Devtools })))
  : () => null;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    const { data } = await authClient.getSession();
    const user = data?.user ?? null;

    if (!user && !location.pathname.startsWith("/auth")) {
      throw redirect({
        to: "/auth/sign-in",
        search: { redirect: location.href },
      });
    }
    return { user };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <Toaster>
      <Outlet />
      <Suspense>
        <Devtools />
      </Suspense>
    </Toaster>
  );
}
