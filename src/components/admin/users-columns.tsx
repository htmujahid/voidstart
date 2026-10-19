import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, ShieldIcon, Text, UserRoundIcon } from "lucide-react";

import { getDataTableActionsColumn } from "@/components/data-table/data-table-actions-column";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { getDataTableSelectColumn } from "@/components/data-table/data-table-select-column";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel, hasAdminRole } from "@/lib/auth/permissions";
import { ROLE_OPTIONS } from "@/lib/auth/roles";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { getColumnOptions } from "@/lib/data-table-parsers";
import { formatDate } from "@/lib/format";
import { usersColumnConfigs, type AdminUser } from "@/lib/queries/admin";
import { userDisplayName, userInitials } from "@/lib/user";

import { UserRowActions, type UserRowAction } from "./user-row-actions";

interface CreateUsersColumnsOptions {
  currentUserId: string;
  onRowAction: (action: UserRowAction) => void;
}

export function createUsersColumns({
  currentUserId,
  onRowAction,
}: CreateUsersColumnsOptions): ColumnDef<DataTableFeatures, AdminUser>[] {
  return [
    getDataTableSelectColumn<AdminUser>(),
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Name" />,
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
      meta: { label: "Name", icon: UserRoundIcon },
      size: 220,
      ...getColumnOptions(usersColumnConfigs.name),
    },
    {
      id: "email",
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Email" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="truncate">{row.original.email}</span>
          {!row.original.emailVerified && <Badge variant="outline">Unverified</Badge>}
        </div>
      ),
      meta: { label: "Email", placeholder: "Search emails…", variant: "text", icon: Text },
      size: 280,
      ...getColumnOptions(usersColumnConfigs.email),
    },
    {
      id: "role",
      accessorFn: (user) => user.role || "user",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Role" />,
      cell: ({ row }) => {
        return (
          <Badge variant={hasAdminRole(row.original.role) ? "default" : "secondary"}>
            {getRoleLabel(row.original.role)}
          </Badge>
        );
      },
      meta: {
        label: "Role",
        variant: "select",
        options: ROLE_OPTIONS,
        icon: ShieldIcon,
      },
      size: 120,
      ...getColumnOptions(usersColumnConfigs.role),
    },
    {
      id: "status",
      accessorFn: (user) => (user.banned ? "banned" : "active"),
      header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
      cell: ({ row }) => {
        const user = row.original;
        return user.banned ? (
          <Badge
            variant="destructive"
            title={
              [user.banReason, user.banExpires && `until ${formatDate(user.banExpires)}`]
                .filter(Boolean)
                .join(" · ") || "Banned"
            }
          >
            Banned
          </Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        );
      },
      meta: { label: "Status" },
      size: 110,
      enableSorting: false,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Created" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.createdAt, { month: "short" })}
        </span>
      ),
      meta: { label: "Created", icon: CalendarIcon },
      size: 130,
      ...getColumnOptions(usersColumnConfigs.createdAt),
    },
    getDataTableActionsColumn<AdminUser>({
      contentClassName: "min-w-52",
      actions: ({ row }) => (
        <UserRowActions
          user={row.original}
          isSelf={row.original.id === currentUserId}
          onRowAction={onRowAction}
        />
      ),
      getAriaLabel: (row) => `Open actions for ${userDisplayName(row.original)}`,
    }),
  ];
}
