import { index, integer, sqliteTable, text } from 'void/schema-d1';
import { createSelectSchema ,createInsertSchema, createUpdateSchema } from 'void/drizzle-zod';
import { z } from 'zod';

export const projects = sqliteTable(
  'projects',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    status: text('status', { enum: ['active', 'archived'] })
      .notNull()
      .default('active'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [index('projects_status_idx').on(table.status)],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

const omitFields = { id: true, createdAt: true, updatedAt: true } as const;

export const projectsSelectSchema = createSelectSchema(projects);

export const projectsInsertSchema = createInsertSchema(projects).omit(omitFields);

export const projectsUpdateSchema = createUpdateSchema(projects).omit(omitFields);

export const projectsParamsSchema = z.object({
  id: z.coerce.number().pipe(projectsSelectSchema.shape.id),
});
