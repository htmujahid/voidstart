import { useQuery } from "@tanstack/react-query";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { userStatsQueryOptions } from "@/lib/queries/admin";

const STATS = [
  { key: "total", label: "Total users" },
  { key: "admins", label: "Admins" },
  { key: "banned", label: "Banned" },
  { key: "unverified", label: "Unverified" },
] as const;

export function UserStats() {
  const { data, isPending, error } = useQuery(userStatsQueryOptions());

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STATS.map(({ key, label }) => (
        <Card key={key} size="sm">
          <CardHeader>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {isPending ? (
                <Skeleton className="h-8 w-12" />
              ) : error ? (
                "-"
              ) : (
                data[key].toLocaleString()
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
