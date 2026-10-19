import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { cn } from "cn";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  /** First load, no rows to show yet. */
  loading?: boolean;
  /** Refetching while the previous rows stay on screen. */
  fetching?: boolean;
  emptyMessage?: string;
}

const SKELETON_ROWS = 5;

export function DataTable<TData>({
  table,
  loading,
  fetching,
  emptyMessage = "No results.",
}: DataTableProps<TData>) {
  const columnCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table
        aria-busy={loading || fetching}
        className={cn("transition-opacity", fetching && "opacity-60")}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: SKELETON_ROWS }, (_, row) => (
              <TableRow key={row}>
                {Array.from({ length: columnCount }, (_, cell) => (
                  <TableCell key={cell}>
                    <Skeleton className="h-5 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
