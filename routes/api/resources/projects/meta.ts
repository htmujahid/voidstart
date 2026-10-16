import { defineHandler } from 'void';
import { z } from 'zod';
import { projectsColumnsMeta, projectsTableMeta } from '@/resources/projects/projects.meta';
import {
  projectsInsertSchema,
  projectsSelectSchema,
  projectsUpdateSchema,
} from '@/resources/projects/projects.schema';

const schemas = {
  select: z.toJSONSchema(projectsSelectSchema),
  insert: z.toJSONSchema(projectsInsertSchema),
  update: z.toJSONSchema(projectsUpdateSchema),
};

export const GET = defineHandler(async () => {
  return { table: projectsTableMeta, columns: projectsColumnsMeta, schemas };
});
