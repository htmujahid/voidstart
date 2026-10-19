import type { Context } from "hono";
import { requireAuth } from "void/auth";

import { forbiddenError } from "@/lib/errors";

import { can, type Permissions } from "./permissions";

export function requirePermission(c: Context, permissions: Permissions) {
  const user = requireAuth(c as Parameters<typeof requireAuth>[0]);
  const { role } = user as { role?: string | null };
  if (!can(role, permissions)) throw forbiddenError("You don't have permission to do that.");
  return user;
}
