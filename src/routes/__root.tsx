import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { auth } from "void/client/react";

import { Toaster } from "@/components/ui/toast";
import "../styles.css";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const { data } = await auth.getSession();
    const user = data?.user ?? null;

    // Everything outside /auth requires a signed-in user.
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
    </Toaster>
  );
}
