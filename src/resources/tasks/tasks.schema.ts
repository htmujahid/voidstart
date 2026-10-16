import { index, integer, sqliteTable, text } from 'void/schema-d1';
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'void/drizzle-zod';
import { z } from 'zod';
import { projects } from '../projects/projects.schema';

export const tasks = sqliteTable(
  'tasks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // A task belongs to zero or one project; deleting the project detaches its tasks.
    projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['todo', 'in_progress', 'done'] })
      .notNull()
      .default('todo'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [
    index('tasks_project_id_idx').on(table.projectId),
    index('tasks_status_idx').on(table.status),
  ],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

const omitFields = { id: true, createdAt: true, updatedAt: true } as const;

export const tasksSelectSchema = createSelectSchema(tasks);

export const tasksInsertSchema = createInsertSchema(tasks).omit(omitFields);

export const tasksUpdateSchema = createUpdateSchema(tasks).omit(omitFields);

export const tasksParamsSchema = z.object({
  id: z.coerce.number().pipe(tasksSelectSchema.shape.id),
});
