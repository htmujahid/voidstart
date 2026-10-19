import { Suspense, lazy } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRouteWithContext, redirect } from "@tanstack/react-router";

import { Toaster } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/auth-client";
import { authConfigQueryOptions } from "@/lib/queries/auth";

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
    return { user, session: data?.session ?? null };
  },
  loader: ({ context: { queryClient } }) => queryClient.query(authConfigQueryOptions),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.appName }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <Toaster>
      <HeadContent />
      <Outlet />
      <Suspense>
        <Devtools />
      </Suspense>
    </Toaster>
  );
}
