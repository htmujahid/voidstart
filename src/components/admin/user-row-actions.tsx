import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BanIcon,
  LogOutIcon,
  ShieldIcon,
  Trash2Icon,
  UserCheckIcon,
  UserRoundCogIcon,
} from "lucide-react";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { useAdminAction } from "@/hooks/use-admin-action";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth/auth-client";
import {
  DEFAULT_ROLE,
  ROLE_META,
  type Permissions,
  type RoleName,
} from "@/lib/auth/access-data";
import { hasAdminRole } from "@/lib/auth/access-utils";
import type { AdminUser } from "@/lib/queries/admin";
import { userCan, userDisplayName } from "@/lib/user";

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
  const me = useUser();
  const allowed = (permissions: Permissions) => userCan(me, permissions);

  const canImpersonate =
    !isSelf &&
    allowed({ user: ["impersonate"] }) &&
    (!hasAdminRole(user.role) || allowed({ user: ["impersonate-admins"] }));
  const canSetRole = allowed({ user: ["set-role"] });
  const canRevoke = allowed({ session: ["revoke"] });
  const canBan = allowed({ user: ["ban"] });
  const canDelete = allowed({ user: ["delete"] });

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

  const manageGroup = canImpersonate || canSetRole || canRevoke;
  const dangerGroup = canBan || canDelete;

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="truncate">{userDisplayName(user)}</DropdownMenuLabel>
      </DropdownMenuGroup>
      {manageGroup && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {canImpersonate && (
              <DropdownMenuItem onClick={() => void impersonate()}>
                <UserRoundCogIcon />
                Impersonate
              </DropdownMenuItem>
            )}
            {canSetRole && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={isSelf}>
                  <ShieldIcon />
                  Change role
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={user.role || DEFAULT_ROLE}
                    onValueChange={(role) =>
                      void run(
                        () => authClient.admin.setRole({ userId: user.id, role: role as RoleName }),
                        "Role updated",
                        "Couldn't change role",
                      )
                    }
                  >
                    {Object.entries(ROLE_META).map(([value, { label }]) => (
                      <DropdownMenuRadioItem key={value} value={value}>
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            {canRevoke && (
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
            )}
          </DropdownMenuGroup>
        </>
      )}
      {dangerGroup && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {canBan &&
              (user.banned ? (
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
                <DropdownMenuItem
                  disabled={isSelf}
                  onClick={() => onRowAction({ user, type: "ban" })}
                >
                  <BanIcon />
                  Ban…
                </DropdownMenuItem>
              ))}
            {canDelete && (
              <DropdownMenuItem
                variant="destructive"
                disabled={isSelf}
                onClick={() => onRowAction({ user, type: "delete" })}
              >
                <Trash2Icon />
                Delete…
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </>
      )}
    </>
  );
}
