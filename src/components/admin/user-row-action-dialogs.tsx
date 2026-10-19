import { BanUserDialog } from "./ban-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import type { UserRowAction } from "./user-row-actions";

export function UserRowActionDialogs({
  action,
  onClose,
}: {
  action: UserRowAction | null;
  onClose: () => void;
}) {
  const onOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <>
      <BanUserDialog
        user={action?.user}
        open={action?.type === "ban"}
        onOpenChange={onOpenChange}
      />
      <DeleteUserDialog
        user={action?.user}
        open={action?.type === "delete"}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
