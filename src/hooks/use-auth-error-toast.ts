import { useEffect } from "react";

import { toast } from "@/components/ui/toast";

export function useAuthErrorToast(error?: string) {
  useEffect(() => {
    if (!error) return;
    toast.add({
      type: "error",
      title: "Sign in failed",
      description: error.replaceAll("_", " "),
    });
  }, [error]);
}
