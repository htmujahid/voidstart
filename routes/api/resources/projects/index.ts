import { defineHandler } from "void";

import { projectsEvents } from "@/resources/projects/projects.event";
import { projectsHooks } from "@/resources/projects/projects.hooks";
import { projectsRepository } from "@/resources/projects/projects.repository";
import { projectsInsertSchema } from "@/resources/projects/projects.schema";

export const GET = defineHandler(async () => {
  return projectsRepository.findAll();
});

export const POST = defineHandler.withValidator({
  body: projectsInsertSchema,
})(async (c, { body }) => {
  const data = await projectsHooks.beforeCreate(body);
  const project = await projectsRepository.create(data);
  projectsEvents.emit(c, "project:created", project);
  return c.json(project, 201);
});
