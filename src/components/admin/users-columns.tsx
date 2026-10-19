import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { AdminUser } from "@/lib/queries/admin";
import { userDisplayName, userInitials } from "@/lib/user";

import { UserActions } from "./user-actions";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

function banSummary(user: AdminUser) {
  const parts = [
    user.banReason,
    user.banExpires && `until ${dateFormat.format(new Date(user.banExpires))}`,
  ];
  return parts.filter(Boolean).join(" · ") || "Banned";
}

export function createUsersColumns(currentUserId: string): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage src={user.image ?? undefined} alt="" />
              <AvatarFallback>{userInitials(user)}</AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{userDisplayName(user)}</span>
            {user.id === currentUserId && <Badge variant="outline">You</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="truncate">{row.original.email}</span>
          {!row.original.emailVerified && <Badge variant="outline">Unverified</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => {
        const role = row.original.role || "user";
        return <Badge variant={role.includes("admin") ? "default" : "secondary"}>{role}</Badge>;
      },
    },
    {
      id: "status",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) =>
        row.original.banned ? (
          <Badge variant="destructive" title={banSummary(row.original)}>
            Banned
          </Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {dateFormat.format(new Date(row.original.createdAt))}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <UserActions user={row.original} isSelf={row.original.id === currentUserId} />
        </div>
      ),
    },
  ];
}
