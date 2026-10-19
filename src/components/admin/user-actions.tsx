import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BanIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  Trash2Icon,
  UserCheckIcon,
  UserRoundCogIcon,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/auth-client";
import { usersKey, type AdminUser } from "@/lib/queries/admin";
import { isAdmin, userDisplayName } from "@/lib/user";

const DAY = 60 * 60 * 24;
const BAN_DURATIONS = [
  { value: String(DAY), label: "1 day" },
  { value: String(DAY * 7), label: "7 days" },
  { value: String(DAY * 30), label: "30 days" },
  { value: "permanent", label: "Permanent" },
];

type ApiResult = { error: { message?: string } | null };

export function UserActions({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [banOpen, setBanOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const name = userDisplayName(user);
  const userIsAdmin = isAdmin(user);

  /** Runs an admin call, toasts the outcome and refreshes the table. Returns whether it succeeded. */
  async function run(call: () => Promise<ApiResult>, success: string, failure: string) {
    const { error } = await call();
    if (error) {
      toast.add({
        type: "error",
        title: failure,
        description: error.message ?? "Something went wrong.",
      });
      return false;
    }
    toast.add({ type: "success", title: success });
    await queryClient.invalidateQueries({ queryKey: usersKey });
    return true;
  }

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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`} />}
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
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
                    authClient.admin.setRole({
                      userId: user.id,
                      role: userIsAdmin ? "user" : "admin",
                    }),
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
              <DropdownMenuItem disabled={isSelf} onClick={() => setBanOpen(true)}>
                <BanIcon />
                Ban…
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              disabled={isSelf}
              onClick={() => setRemoveOpen(true)}
            >
              <Trash2Icon />
              Delete…
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <BanDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        name={name}
        onConfirm={async (reason, duration) => {
          const ok = await run(
            () =>
              authClient.admin.banUser({
                userId: user.id,
                banReason: reason || undefined,
                banExpiresIn: duration === "permanent" ? undefined : Number(duration),
              }),
            "User banned",
            "Couldn't ban user",
          );
          if (ok) setBanOpen(false);
        }}
      />

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the account, its connections and sessions. It can't be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
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
    </>
  );
}

function BanDialog({
  open,
  onOpenChange,
  name,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onConfirm: (reason: string, duration: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState(String(DAY * 7));
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            await onConfirm(reason.trim(), duration);
            setPending(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Ban {name}</DialogTitle>
            <DialogDescription>
              Banned users can't sign in and their current sessions are revoked.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ban-reason">Reason (optional)</Label>
            <Input
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Spam, abuse…"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={(value) => value && setDuration(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BAN_DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending && <Spinner />}
              Ban user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
