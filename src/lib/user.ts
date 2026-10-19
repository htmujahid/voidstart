export function userDisplayName(user: { name: string; email: string }) {
  return user.name.trim() || user.email;
}

export function userInitials(user: { name: string; email: string }) {
  return userDisplayName(user).slice(0, 2).toUpperCase();
}

export function isAdmin(user: { role?: string | null } | null | undefined) {
  return Boolean(user?.role?.split(",").some((role) => role.trim() === "admin"));
}
