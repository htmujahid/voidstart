import { defineHandler } from "void";

import { requirePermission } from "@/lib/auth/access-utils";
import { projectsEvents } from "@/resources/projects/projects.event";
import { projectsHooks } from "@/resources/projects/projects.hooks";
import { projectsRepository } from "@/resources/projects/projects.repository";
import { projectsInsertSchema } from "@/resources/projects/projects.schema";

export const GET = defineHandler(async (c) => {
  requirePermission(c, { projects: ["list"] });
  return projectsRepository.findAll();
});

export const POST = defineHandler.withValidator({
  body: projectsInsertSchema,
})(async (c, { body }) => {
  requirePermission(c, { projects: ["create"] });
  const data = await projectsHooks.beforeCreate(body);
  const project = await projectsRepository.create(data);
  projectsEvents.emit(c, "project:created", project);
  return c.json(project, 201);
});
