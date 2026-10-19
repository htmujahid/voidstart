import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BanIcon,
  LogOutIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  Trash2Icon,
  UserCheckIcon,
  UserRoundCogIcon,
} from "lucide-react";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/auth-client";
import type { AdminUser } from "@/lib/queries/admin";
import { isAdmin, userDisplayName } from "@/lib/user";

import { useAdminAction } from "./use-admin-action";

export interface UserRowAction {
  user: AdminUser;
  type: "ban" | "delete";
}

export function UserRowActions({
  user,
  isSelf,
  onRowAction,
}: {
  user: AdminUser;
  isSelf: boolean;
  onRowAction: (action: UserRowAction) => void;
}) {
  const run = useAdminAction();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const userIsAdmin = isAdmin(user);

  async function impersonate() {
    const { error } = await authClient.admin.impersonateUser({ userId: user.id });
    if (error) {
      toast.add({
        type: "error",
        title: "Couldn't impersonate",
        description: error.message ?? "Something went wrong.",
      });
      return;
    }
    queryClient.clear();
    await navigate({ to: "/" });
  }

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="truncate">{userDisplayName(user)}</DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {!isSelf && (
          <DropdownMenuItem onClick={() => void impersonate()}>
            <UserRoundCogIcon />
            Impersonate
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          disabled={isSelf}
          onClick={() =>
            void run(
              () =>
                authClient.admin.setRole({ userId: user.id, role: userIsAdmin ? "user" : "admin" }),
              userIsAdmin ? "Admin role removed" : "Made admin",
              "Couldn't change role",
            )
          }
        >
          {userIsAdmin ? <ShieldOffIcon /> : <ShieldCheckIcon />}
          {userIsAdmin ? "Remove admin" : "Make admin"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            void run(
              () => authClient.admin.revokeUserSessions({ userId: user.id }),
              "Sessions revoked",
              "Couldn't revoke sessions",
            )
          }
        >
          <LogOutIcon />
          Revoke sessions
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {user.banned ? (
          <DropdownMenuItem
            onClick={() =>
              void run(
                () => authClient.admin.unbanUser({ userId: user.id }),
                "User unbanned",
                "Couldn't unban user",
              )
            }
          >
            <UserCheckIcon />
            Unban
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled={isSelf} onClick={() => onRowAction({ user, type: "ban" })}>
            <BanIcon />
            Ban…
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          disabled={isSelf}
          onClick={() => onRowAction({ user, type: "delete" })}
        >
          <Trash2Icon />
          Delete…
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );
}
