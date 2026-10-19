import { useRouter } from "@tanstack/react-router";

import { toast } from "@/components/ui/toast";

const expiredCodes = ["INVALID_TWO_FACTOR_COOKIE", "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE"];

export function useTwoFactorError(redirectTo?: string) {
  const router = useRouter();

  return (error: { code?: string; message?: string }) => {
    toast.add({
      type: "error",
      title: "Verification failed",
      description: error.message ?? "Invalid or expired code.",
    });
    if (error.code === "INVALID_TWO_FACTOR_COOKIE") {
      void router.navigate({ to: "/auth/sign-in", search: { redirect: redirectTo } });
    }
    return expiredCodes.includes(error.code ?? "");
  };
}
