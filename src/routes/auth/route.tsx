import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { Logo } from "@/components/logo";
// Signed-in users have no business on the auth pages.
export const Route = createFileRoute("/auth")({
  beforeLoad: ({ context }) => {
    if (context.user) throw redirect({ to: "/" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Logo className="size-4" />
          </div>
          locosheet
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
