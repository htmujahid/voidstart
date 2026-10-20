import type { ResourceMeta } from "@/lib/meta";

import type { Task } from "./tasks.schema";

export const tasksMeta = {
  name: "Tasks",
  description: "Units of work, optionally belonging to a project.",
  icon: "ListTodo",
  columns: {
    id: {
      name: "ID",
      description: "Unique task identifier.",
      icon: "Hash",
      sortable: true,
      hidden: true,
    },
    projectId: {
      name: "Project",
      description: "Project this task belongs to.",
      icon: "FolderKanban",
      sortable: true,
      filterable: true,
    },
    title: {
      name: "Title",
      description: "Short summary of the task.",
      icon: "Type",
      sortable: true,
      filterable: true,
    },
    description: {
      name: "Description",
      description: "Details about the task.",
      icon: "AlignLeft",
    },
    status: {
      name: "Status",
      description: "Progress of the task.",
      icon: "CircleDot",
      sortable: true,
      filterable: true,
    },
    createdAt: {
      name: "Created",
      description: "When the task was created.",
      icon: "CalendarPlus",
      type: "datetime",
      sortable: true,
    },
    updatedAt: {
      name: "Updated",
      description: "When the task was last updated.",
      icon: "CalendarClock",
      type: "datetime",
      sortable: true,
      hidden: true,
    },
  },
} as const satisfies ResourceMeta<Task>;
