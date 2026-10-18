import type { ColumnsMeta, TableMeta } from "@/lib/meta";

import type { Task } from "./tasks.schema";

export const tasksTableMeta = {
  name: "Tasks",
} as const satisfies TableMeta;

export const tasksColumnsMeta = {
  id: { label: "ID", type: "number", sortable: true, hidden: true },
  projectId: { label: "Project", type: "number", sortable: true, filterable: true },
  title: { label: "Title", type: "text", sortable: true, filterable: true },
  description: { label: "Description", type: "text" },
  status: {
    label: "Status",
    type: "enum",
    options: ["todo", "in_progress", "done"],
    sortable: true,
    filterable: true,
  },
  createdAt: { label: "Created", type: "datetime", sortable: true },
  updatedAt: { label: "Updated", type: "datetime", sortable: true, hidden: true },
} as const satisfies ColumnsMeta<Task>;
