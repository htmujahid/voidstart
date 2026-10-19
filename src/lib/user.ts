export function userDisplayName(user: { name: string; email: string }) {
  return user.name.trim() || user.email;
}

export function userInitials(user: { name: string; email: string }) {
  return userDisplayName(user).slice(0, 2).toUpperCase();
}
