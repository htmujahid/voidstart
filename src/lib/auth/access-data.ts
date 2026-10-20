import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  ...adminAc.statements,
});

export const userRole = ac.newRole({
  ...userAc.statements,
});

export const roles = { admin: adminRole, user: userRole };

export type RoleName = keyof typeof roles;

export const ROLE_META: Record<RoleName, { label: string; description: string }> = {
  admin: { label: "Admin", description: "Full access, including user management." },
  user: { label: "User", description: "Standard access, no user management." },
};

export const DEFAULT_ROLE: RoleName = "user";
export const ADMIN_ROLES: RoleName[] = ["admin"];

export type Permissions = {
  [Name in keyof typeof statement]?: ReadonlyArray<(typeof statement)[Name][number]>;
};
