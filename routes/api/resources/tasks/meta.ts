import { defineHandler } from "void";

import { requirePermission } from "@/lib/auth/access-server";
import { getTableMeta } from "@/lib/table-meta";
import { tasksMeta } from "@/resources/tasks/tasks.meta";
import { tasks } from "@/resources/tasks/tasks.schema";

const meta = getTableMeta(tasks, tasksMeta);

export const GET = defineHandler(async (c) => {
  requirePermission(c, { tasks: ["list"] });
  return meta;
});
