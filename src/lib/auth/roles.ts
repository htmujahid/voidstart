import { ShieldCheckIcon, UserIcon } from "lucide-react";

import { ROLE_META } from "@/lib/auth/permissions";

export const ROLE_OPTIONS = [
  { value: "admin", label: ROLE_META.admin.label, icon: ShieldCheckIcon },
  { value: "user", label: ROLE_META.user.label, icon: UserIcon },
];
