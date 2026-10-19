import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth/auth-client";
import type { AdminUser } from "@/lib/queries/admin";
import { userDisplayName } from "@/lib/user";

import { useAdminAction } from "./use-admin-action";

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const run = useAdminAction();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {user ? userDisplayName(user) : ""}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the account, its connections and sessions. It can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              user &&
              void run(
                () => authClient.admin.removeUser({ userId: user.id }),
                "User deleted",
                "Couldn't delete user",
              )
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
