import type { ColumnsMeta, TableMeta } from "@/lib/meta";

import type { Project } from "./projects.schema";

export const projectsTableMeta = {
  name: "Projects",
} as const satisfies TableMeta;

export const projectsColumnsMeta = {
  id: { label: "ID", type: "number", sortable: true, hidden: true },
  name: { label: "Name", type: "text", sortable: true, filterable: true },
  slug: { label: "Slug", type: "text", sortable: true, filterable: true },
  description: { label: "Description", type: "text" },
  status: {
    label: "Status",
    type: "enum",
    options: ["active", "archived"],
    sortable: true,
    filterable: true,
  },
  createdAt: { label: "Created", type: "datetime", sortable: true },
  updatedAt: { label: "Updated", type: "datetime", sortable: true, hidden: true },
} as const satisfies ColumnsMeta<Project>;
