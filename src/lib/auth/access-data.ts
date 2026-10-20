import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  projects: ["create", "list", "get", "update", "delete"],
  tasks: ["create", "list", "get", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  ...adminAc.statements,
  projects: ["create", "list", "get", "update", "delete"],
  tasks: ["create", "list", "get", "update", "delete"],
});

export const userRole = ac.newRole({
  ...userAc.statements,
  projects: ["create", "list", "get", "update"],
  tasks: ["create", "list", "get", "update"],
});

export const roles = { admin: adminRole, user: userRole };

export type RoleName = keyof typeof roles;

export const ROLE_META: Record<RoleName, { label: string; description: string }> = {
  admin: { label: "Admin", description: "Full access, including user management." },
  user: { label: "User", description: "Creates and edits resources, cannot delete them." },
};

export const DEFAULT_ROLE: RoleName = "user";
export const ADMIN_ROLES: RoleName[] = ["admin"];

export type Permissions = {
  [Name in keyof typeof statement]?: ReadonlyArray<(typeof statement)[Name][number]>;
};
