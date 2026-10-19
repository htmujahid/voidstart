import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth/auth-client";

export function LastUsedBadge({ method }: { method: string }) {
  if (!authClient.isLastUsedLoginMethod(method)) return null;

  return (
    <Badge
      variant="secondary"
      className="pointer-events-none absolute -top-2 right-2 h-4 border-border bg-background px-1.5 text-[10px] text-muted-foreground"
    >
      Last used
    </Badge>
  );
}
