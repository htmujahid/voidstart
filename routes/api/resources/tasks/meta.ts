import { defineHandler } from "void";
import { z } from "zod";

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

export const GET = defineHandler(async () => {
  return { table: tasksTableMeta, columns: tasksColumnsMeta, schemas };
});
