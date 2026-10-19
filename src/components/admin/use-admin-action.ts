import { useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/toast";
import { usersKey } from "@/lib/queries/admin";

type ApiResult = { error: { message?: string } | null };

export function useAdminAction() {
  const queryClient = useQueryClient();

  return async function run(call: () => Promise<ApiResult>, success: string, failure: string) {
    const { error } = await call();
    if (error) {
      toast.add({
        type: "error",
        title: failure,
        description: error.message ?? "Something went wrong.",
      });
      return false;
    }
    toast.add({ type: "success", title: success });
    await queryClient.invalidateQueries({ queryKey: usersKey });
    return true;
  };
}
