import { Link } from "@tanstack/react-router";
import { LogOutIcon, ShieldCheckIcon, UserIcon, UserRoundXIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useImpersonation } from "@/hooks/use-impersonation";
import { useSignOut } from "@/hooks/use-sign-out";
import { useUser } from "@/hooks/use-user";
import { isAdmin, userDisplayName, userInitials } from "@/lib/user";

export function UserMenu() {
  const user = useUser();
  const signOut = useSignOut();
  const { impersonating, stop: stopImpersonating } = useImpersonation();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Open user menu"
      >
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt={userDisplayName(user)} />
          <AvatarFallback>{userInitials(user)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="grid text-left font-normal">
            <span className="truncate text-sm font-medium text-foreground">
              {userDisplayName(user)}
            </span>
            <span className="truncate text-xs">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to="/account/profile" />}>
            <UserIcon />
            Account
          </DropdownMenuItem>
          {isAdmin(user) && (
            <DropdownMenuItem render={<Link to="/admin" />}>
              <ShieldCheckIcon />
              Admin
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {impersonating && (
          <DropdownMenuItem onClick={() => void stopImpersonating()}>
            <UserRoundXIcon />
            Stop impersonating
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
