import { createEmitter, defineHandlers } from "@hono/event-emitter";

import type { Project } from "./projects.schema";

export type ProjectEvents = {
  "project:created": Project;
};

export const projectsEventHandlers = defineHandlers<ProjectEvents>({
  "project:created": [
    (_c, project) => {
      console.log(`[event] project created: ${project.id} (${project.slug})`);
    },
  ],
});

export const projectsEvents = createEmitter(projectsEventHandlers);
