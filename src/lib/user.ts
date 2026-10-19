import { can, type Permissions } from "@/lib/auth/permissions";

export function userDisplayName(user: { name: string; email: string }) {
  return user.name.trim() || user.email;
}

export function userInitials(user: { name: string; email: string }) {
  return userDisplayName(user).slice(0, 2).toUpperCase();
}

export function userCan(
  user: { role?: string | null } | null | undefined,
  permissions: Permissions,
) {
  return Boolean(user) && can(user?.role, permissions);
}

export const ADMIN_ACCESS: Permissions = { user: ["list"] };
