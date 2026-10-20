import { ADMIN_ROLES, DEFAULT_ROLE, ROLE_META, roles, statement } from "./access-data";
import type { Permissions, RoleName } from "./access-data";

export function getRoleNames(role: string | null | undefined) {
  return (role || DEFAULT_ROLE)
    .split(",")
    .map((name) => name.trim())
    .filter((name): name is RoleName => name in roles);
}

export function can(role: string | null | undefined, permissions: Permissions) {
  return getRoleNames(role).some((name) => roles[name].authorize(permissions).success);
}

export function hasAdminRole(role: string | null | undefined) {
  return getRoleNames(role).some((name) => ADMIN_ROLES.includes(name));
}

export function getRoleLabel(role: string | null | undefined) {
  return getRoleNames(role)
    .map((name) => ROLE_META[name].label)
    .join(", ");
}

export function getGrantedPermissions(role: string | null | undefined) {
  const names = getRoleNames(role);
  return Object.entries(statement).map(([resource, actions]) => ({
    resource,
    actions: actions.filter((action) =>
      names.some((name) =>
        (roles[name].statements as Record<string, readonly string[]>)[resource]?.includes(action),
      ),
    ),
  }));
}
