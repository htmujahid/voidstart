import { defineHandler } from 'void';
import { tasksHooks } from '@/resources/tasks/tasks.hooks';
import { tasksRepository } from '@/resources/tasks/tasks.repository';
import { tasksParamsSchema, tasksUpdateSchema } from '@/resources/tasks/tasks.schema';

export const GET = defineHandler.withValidator({
  params: tasksParamsSchema,
})(async (c, { params }) => {
  const task = await tasksRepository.findById(params.id);
  return task ?? c.json({ error: 'Task not found' }, 404);
});

export const PATCH = defineHandler.withValidator({
  params: tasksParamsSchema,
  body: tasksUpdateSchema,
})(async (c, { params, body }) => {
  const data = await tasksHooks.beforeUpdate(params.id, body);
  const task = await tasksRepository.update(params.id, data);
  return task ?? c.json({ error: 'Task not found' }, 404);
});

export const DELETE = defineHandler.withValidator({
  params: tasksParamsSchema,
})(async (c, { params }) => {
  const deleted = await tasksRepository.delete(params.id);
  return deleted ? null : c.json({ error: 'Task not found' }, 404);
});
