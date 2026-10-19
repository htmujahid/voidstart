import { defineHandler } from "void";

import { requirePermission } from "@/lib/auth/require-permission";
import { tasksEvents } from "@/resources/tasks/tasks.event";
import { tasksHooks } from "@/resources/tasks/tasks.hooks";
import { tasksRepository } from "@/resources/tasks/tasks.repository";
import { tasksInsertSchema } from "@/resources/tasks/tasks.schema";

export const GET = defineHandler(async (c) => {
  requirePermission(c, { tasks: ["list"] });
  return tasksRepository.findAll();
});

export const POST = defineHandler.withValidator({
  body: tasksInsertSchema,
})(async (c, { body }) => {
  requirePermission(c, { tasks: ["create"] });
  const data = await tasksHooks.beforeCreate(body);
  const task = await tasksRepository.create(data);
  tasksEvents.emit(c, "task:created", task);
  return c.json(task, 201);
});
