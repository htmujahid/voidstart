import type { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <span>{title}</span>;

  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ChevronsUpDownIcon;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2.5 data-[sorted=true]:text-foreground"
      data-sorted={Boolean(sorted)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      <Icon />
    </Button>
  );
}
