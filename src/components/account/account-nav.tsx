import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { LinkIcon, LaptopIcon, ShieldIcon, UserIcon } from "lucide-react";

import { useAuthConfig } from "@/hooks/use-auth-config";

type AuthConfig = ReturnType<typeof useAuthConfig>;

const sections = [
  { to: "/account/profile", label: "Profile", icon: UserIcon, visible: () => true },
  {
    to: "/account/security",
    label: "Security",
    icon: ShieldIcon,
    visible: (config: AuthConfig) => config.emailSignIn || config.passkey.enabled,
  },
  {
    to: "/account/connections",
    label: "Connections",
    icon: LinkIcon,
    visible: (config: AuthConfig) => config.canLinkAccounts,
  },
  { to: "/account/sessions", label: "Sessions", icon: LaptopIcon, visible: () => true },
] satisfies {
  to: string;
  label: string;
  icon: ComponentType;
  visible: (config: AuthConfig) => boolean;
}[];

export function AccountNav() {
  const config = useAuthConfig();

  return (
    <nav className="flex gap-1 overflow-x-auto md:w-44 md:shrink-0 md:flex-col">
      {sections
        .filter((section) => section.visible(config))
        .map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:bg-muted data-[status=active]:font-medium data-[status=active]:text-foreground [&_svg]:size-4"
          >
            <Icon />
            {label}
          </Link>
        ))}
    </nav>
  );
}
