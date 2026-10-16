import { createEmitter, defineHandlers } from '@hono/event-emitter';
import type { Task } from './tasks.schema';

export type TaskEvents = {
  'task:created': Task;
};

export const tasksEventHandlers = defineHandlers<TaskEvents>({
  'task:created': [
    (_c, task) => {
      console.log(`[event] task created: ${task.id} (${task.title})`);
    },
  ],
});

export const tasksEvents = createEmitter(tasksEventHandlers);
