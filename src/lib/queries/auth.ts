import { queryOptions } from "@tanstack/react-query";

export type AuthConfig = {
  appName: string;
  emailAndPassword: {
    enabled: boolean;
    signUp: boolean;
    requireEmailVerification: boolean;
    autoSignIn: boolean;
    resetPassword: boolean;
    minPasswordLength: number;
    maxPasswordLength: number;
  };
  emailVerification: {
    enabled: boolean;
    sendOnSignUp: boolean;
    sendOnSignIn: boolean;
    autoSignInAfterVerification: boolean;
  };
  socialProviders: string[];
  user: {
    changeEmail: boolean;
    deleteUser: boolean;
  };
};

async function fetchAuthConfig(): Promise<AuthConfig> {
  const res = await fetch("/api/auth/config");
  if (!res.ok) throw new Error(`Failed to load auth config (${res.status})`);
  return (await res.json()) as AuthConfig;
}

export const authConfigQueryOptions = queryOptions({
  queryKey: ["auth", "config"],
  queryFn: fetchAuthConfig,
  staleTime: 5 * 60_000,
});
