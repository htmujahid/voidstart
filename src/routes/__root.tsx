import { Link, Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { auth } from "void/client/react";

import { Toaster } from "@/components/ui/toast";
import { SignOutButton } from "@/components/auth/sign-out-button";
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
  const { user } = Route.useRouteContext();
  return (
    <Toaster>
      {user && (
        <nav className="flex items-center gap-4 p-4">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <span className="ml-auto text-sm text-muted-foreground">{user.email}</span>
          <SignOutButton />
        </nav>
      )}
      <Outlet />
    </Toaster>
  );
}
