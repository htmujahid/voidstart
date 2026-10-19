export function userDisplayName(user: { name: string; email: string }) {
  return user.name.trim() || user.email;
}

export function userInitials(user: { name: string; email: string }) {
  return userDisplayName(user).slice(0, 2).toUpperCase();
}

/** Roles are stored as a comma-separated string, so a user can hold several. */
export function isAdmin(user: { role?: string | null } | null | undefined) {
  return Boolean(user?.role?.split(",").some((role) => role.trim() === "admin"));
}
