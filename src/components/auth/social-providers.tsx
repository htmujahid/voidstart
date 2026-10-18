import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldSeparator } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";
import { safeRedirect } from "@/lib/redirect";

import { socialIcons } from "./social-icons";

const socialProviders = {
  apple: { name: "Apple", icon: socialIcons.apple },
  atlassian: {
    name: "Atlassian",
    icon: socialIcons.atlassian,
  },
  cognito: { name: "Cognito", icon: socialIcons.cognito },
  discord: { name: "Discord", icon: socialIcons.discord },
  paybin: { name: "Paybin", icon: socialIcons.paybin },
  polar: { name: "Polar", icon: socialIcons.polar },
  railway: { name: "Railway", icon: socialIcons.railway },
  vercel: { name: "Vercel", icon: socialIcons.vercel },
  wechat: { name: "WeChat", icon: socialIcons.wechat },
  dropbox: { name: "Dropbox", icon: socialIcons.dropbox },
  facebook: {
    name: "Facebook",
    icon: socialIcons.facebook,
  },
  figma: { name: "Figma", icon: socialIcons.figma },
  github: { name: "GitHub", icon: socialIcons.github },
  gitlab: { name: "GitLab", icon: socialIcons.gitlab },
  google: { name: "Google", icon: socialIcons.google },
  huggingface: {
    name: "Hugging Face",
    icon: socialIcons.huggingface,
  },
  kakao: { name: "Kakao", icon: socialIcons.kakao },
  kick: { name: "Kick", icon: socialIcons.kick },
  line: { name: "LINE", icon: socialIcons.line },
  linear: { name: "Linear", icon: socialIcons.linear },
  linkedin: {
    name: "LinkedIn",
    icon: socialIcons.linkedin,
  },
  microsoft: {
    name: "Microsoft",
    icon: socialIcons.microsoft,
  },
  naver: { name: "Naver", icon: socialIcons.naver },
  notion: { name: "Notion", icon: socialIcons.notion },
  paypal: { name: "PayPal", icon: socialIcons.paypal },
  reddit: { name: "Reddit", icon: socialIcons.reddit },
  roblox: { name: "Roblox", icon: socialIcons.roblox },
  salesforce: {
    name: "Salesforce",
    icon: socialIcons.salesforce,
  },
  slack: { name: "Slack", icon: socialIcons.slack },
  spotify: { name: "Spotify", icon: socialIcons.spotify },
  tiktok: { name: "TikTok", icon: socialIcons.tiktok },
  twitch: { name: "Twitch", icon: socialIcons.twitch },
  twitter: { name: "X", icon: socialIcons.twitter },
  vk: { name: "VK", icon: socialIcons.vk },
  zoom: { name: "Zoom", icon: socialIcons.zoom },
} satisfies Record<string, { name: string; icon: React.ComponentType }>;

export type SocialProvider = keyof typeof socialProviders;

export function isSocialProvider(value: string): value is SocialProvider {
  return value in socialProviders;
}

function getSocialProvider(id: string) {
  if (isSocialProvider(id)) return socialProviders[id];
  return {
    name: id.charAt(0).toUpperCase() + id.slice(1),
    icon: socialIcons.other,
  };
}

export function SocialProviders({
  action,
  redirectTo,
  showEmail,
}: {
  action: "Sign in" | "Sign up";
  redirectTo?: string;
  showEmail: boolean;
}) {
  const { socialProviders: enabledProviders } = useAuthConfig();
  const [pending, setPending] = useState<string | null>(null);

  if (enabledProviders.length === 0) return null;

  async function signIn(provider: string) {
    setPending(provider);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: safeRedirect(redirectTo),
      errorCallbackURL: "/auth/sign-in",
    });
    if (error) {
      setPending(null);
      toast.add({
        type: "error",
        title: `${action} failed`,
        description: error.message ?? "Unable to continue with that provider.",
      });
    }
  }

  return (
    <>
      <Field>
        {enabledProviders.map((id) => {
          const { name, icon: Icon } = getSocialProvider(id);
          return (
            <Button
              key={id}
              type="button"
              variant="outline"
              disabled={pending !== null}
              onClick={() => signIn(id)}
            >
              {pending === id ? <Spinner /> : <Icon />}
              {action} with {name}
            </Button>
          );
        })}
      </Field>
      {showEmail && (
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>
      )}
    </>
  );
}
