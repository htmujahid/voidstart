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
