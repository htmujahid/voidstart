import * as z from "zod";

export const redirectSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

/** Only allow same-origin, non-auth paths so `?redirect=` can't be abused. */
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
