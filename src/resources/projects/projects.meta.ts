import type { ResourceMeta } from "@/lib/meta";

import type { Project } from "./projects.schema";

export const projectsMeta = {
  name: "Projects",
  description: "Workspaces that group related tasks.",
  icon: "FolderKanban",
  columns: {
    id: {
      name: "ID",
      description: "Unique project identifier.",
      icon: "Hash",
      sortable: true,
      hidden: true,
    },
    name: {
      name: "Name",
      description: "Display name of the project.",
      icon: "Type",
      sortable: true,
      filterable: true,
    },
    slug: {
      name: "Slug",
      description: "Unique URL-friendly identifier.",
      icon: "Link",
      sortable: true,
      filterable: true,
    },
    description: {
      name: "Description",
      description: "What the project is about.",
      icon: "AlignLeft",
    },
    status: {
      name: "Status",
      description: "Whether the project is active or archived.",
      icon: "CircleDot",
      sortable: true,
      filterable: true,
    },
    createdAt: {
      name: "Created",
      description: "When the project was created.",
      icon: "CalendarPlus",
      type: "datetime",
      sortable: true,
    },
    updatedAt: {
      name: "Updated",
      description: "When the project was last updated.",
      icon: "CalendarClock",
      type: "datetime",
      sortable: true,
      hidden: true,
    },
  },
} as const satisfies ResourceMeta<Project>;
