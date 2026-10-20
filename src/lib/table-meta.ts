import { getTableColumns, getTableName, type Column, type Table } from "drizzle-orm";

import type { ColumnMeta as ColumnDisplayMeta, ColumnType, ResourceMeta } from "@/lib/meta";

export type ColumnMeta = Partial<ColumnDisplayMeta> & {
  id: string;
  dataType: string;
  nullable: boolean;
  options?: string[];
};

export type TableMeta = {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  columns: ColumnMeta[];
};

const dataTypeToColumnType: Record<string, ColumnType> = {
  number: "number",
  bigint: "number",
  boolean: "boolean",
  json: "json",
  array: "array",
  string: "text",
};

function getColumnType(column: Column): ColumnType {
  if (column.enumValues) return "enum";
  const { columnType } = column;
  if (/Timestamp|DateTime/.test(columnType)) return "datetime";
  if (/Date/.test(columnType)) return "date";
  if (/Time$/.test(columnType)) return "time";
  return dataTypeToColumnType[column.dataType] ?? "text";
}

export function getTableMeta(table: Table, meta?: ResourceMeta<Record<string, unknown>>): TableMeta {
  const displayMeta: Record<string, ColumnDisplayMeta | undefined> = meta?.columns ?? {};
  const columns = Object.entries(getTableColumns(table)).map(([id, column]) => ({
    id,
    dataType: column.dataType,
    nullable: !column.notNull,
    type: getColumnType(column),
    ...displayMeta[id],
    ...(column.enumValues && { type: "enum" as const, options: [...column.enumValues] }),
  }));
  return {
    id: getTableName(table),
    name: meta?.name,
    description: meta?.description,
    icon: meta?.icon,
    columns,
  };
}
