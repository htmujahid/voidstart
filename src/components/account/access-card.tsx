import { CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { ROLE_META } from "@/lib/auth/access-data";
import { getGrantedPermissions, getRoleNames } from "@/lib/auth/access-utils";

import { SettingsCard } from "./settings-card";

export function AccessCard() {
  const user = useUser();
  const roleNames = getRoleNames(user?.role);
  const permissions = getGrantedPermissions(user?.role);

  return (
    <SettingsCard
      title="Role and permissions"
      description="What your role lets you do in this workspace."
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          {roleNames.map((name) => (
            <div key={name} className="flex flex-col gap-1">
              <Badge variant="secondary" className="w-fit">
                {ROLE_META[name].label}
              </Badge>
              <p className="text-sm text-muted-foreground">{ROLE_META[name].description}</p>
            </div>
          ))}
        </div>
        <dl className="flex flex-col divide-y rounded-lg border">
          {permissions.map(({ resource, actions }) => (
            <div
              key={resource}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <dt className="text-sm font-medium capitalize sm:w-32 sm:shrink-0">{resource}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {actions.length > 0 ? (
                  actions.map((action) => (
                    <Badge key={action} variant="outline" className="font-mono">
                      <CheckIcon />
                      {action}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No access</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </SettingsCard>
  );
}
