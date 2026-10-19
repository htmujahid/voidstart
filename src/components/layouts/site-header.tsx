import { Link } from "@tanstack/react-router";
import { cn } from "cn";

import { Logo } from "@/components/logo";
import { useAuthConfig } from "@/hooks/use-auth-config";

import { UserMenu } from "./user-menu";

export function SiteHeader({ className }: { className?: string }) {
  const { appName } = useAuthConfig();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div
        className={cn(
          "mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 md:px-6",
          className,
        )}
      >
        <Link to="/" className="flex items-center gap-2 font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Logo className="size-4" />
          </div>
          {appName}
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
