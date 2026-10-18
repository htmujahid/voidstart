import * as z from "zod";

export const redirectSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
  error: z.string().optional().catch(undefined),
});

export function safeRedirect(path?: string) {
  if (
    !path ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.startsWith("/\\") ||
    path.startsWith("/auth")
  ) {
    return "/";
  }
  return path;
}

export function verifyEmailCallbackURL(redirectTo?: string) {
  const target = safeRedirect(redirectTo);
  if (target === "/") return "/auth/verify-email";
  return `/auth/verify-email?redirect=${encodeURIComponent(target)}`;
}
