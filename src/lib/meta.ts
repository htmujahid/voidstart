export type ColumnType =
  | "text"
  | "number"
  | "boolean"
  | "enum"
  | "date"
  | "datetime"
  | "time"
  | "json"
  | "array";

export type TableMeta = {
  name: string;
  description?: string;
  icon?: string;
};

export type ColumnMeta = {
  name: string;
  description?: string;
  icon?: string;
  type?: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  /** Hide from tables by default. */
  hidden?: boolean;
};

/** Metadata for any subset of the row type's columns. */
export type ColumnsMeta<Row> = { [K in keyof Row]?: ColumnMeta };

export type ResourceMeta<Row> = TableMeta & { columns: ColumnsMeta<Row> };
