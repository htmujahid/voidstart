import { defineHandler } from "void";
import { z } from "zod";

import { requirePermission } from "@/lib/auth/require-permission";
import { tasksColumnsMeta, tasksTableMeta } from "@/resources/tasks/tasks.meta";
import {
  tasksInsertSchema,
  tasksSelectSchema,
  tasksUpdateSchema,
} from "@/resources/tasks/tasks.schema";

const schemas = {
  select: z.toJSONSchema(tasksSelectSchema),
  insert: z.toJSONSchema(tasksInsertSchema),
  update: z.toJSONSchema(tasksUpdateSchema),
};

export const GET = defineHandler(async (c) => {
  requirePermission(c, { tasks: ["list"] });
  return { table: tasksTableMeta, columns: tasksColumnsMeta, schemas };
});
