export type TableMeta = {
  name: string;
};

export type ColumnMeta = {
  label: string;
  type: "text" | "number" | "enum" | "datetime";
  /** Allowed values, for `enum` columns. */
  options?: readonly string[];
  sortable?: boolean;
  filterable?: boolean;
  /** Hide from tables by default. */
  hidden?: boolean;
};

/** Metadata for any subset of the row type's columns. */
export type ColumnsMeta<Row> = { [K in keyof Row]?: ColumnMeta };
