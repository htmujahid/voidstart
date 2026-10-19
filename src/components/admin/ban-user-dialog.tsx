import { useState } from "react";

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
import { authClient } from "@/lib/auth/auth-client";
import type { AdminUser } from "@/lib/queries/admin";
import { userDisplayName } from "@/lib/user";

import { useAdminAction } from "./use-admin-action";

const DAY = 60 * 60 * 24;
const BAN_DURATIONS = [
  { value: String(DAY), label: "1 day" },
  { value: String(DAY * 7), label: "7 days" },
  { value: String(DAY * 30), label: "30 days" },
  { value: "permanent", label: "Permanent" },
];

export function BanUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const run = useAdminAction();
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState(String(DAY * 7));
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!user) return;
    setPending(true);
    const ok = await run(
      () =>
        authClient.admin.banUser({
          userId: user.id,
          banReason: reason.trim() || undefined,
          banExpiresIn: duration === "permanent" ? undefined : Number(duration),
        }),
      "User banned",
      "Couldn't ban user",
    );
    setPending(false);
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Ban {user ? userDisplayName(user) : ""}</DialogTitle>
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
