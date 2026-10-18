import { useRouteContext } from "@tanstack/react-router";

/** The signed-in user from the root route context, or `null` on public pages. */
export function useUser() {
  return useRouteContext({ from: "__root__", select: (ctx) => ctx.user });
}
