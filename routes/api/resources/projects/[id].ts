import { defineHandler } from "void";

import { requirePermission } from "@/lib/auth/access-utils";
import { projectsHooks } from "@/resources/projects/projects.hooks";
import { projectsRepository } from "@/resources/projects/projects.repository";
import { projectsParamsSchema, projectsUpdateSchema } from "@/resources/projects/projects.schema";

export const GET = defineHandler.withValidator({
  params: projectsParamsSchema,
})(async (c, { params }) => {
  requirePermission(c, { projects: ["get"] });
  const project = await projectsRepository.findById(params.id);
  return project ?? c.json({ error: "Project not found" }, 404);
});

export const PATCH = defineHandler.withValidator({
  params: projectsParamsSchema,
  body: projectsUpdateSchema,
})(async (c, { params, body }) => {
  requirePermission(c, { projects: ["update"] });
  const data = await projectsHooks.beforeUpdate(params.id, body);
  const project = await projectsRepository.update(params.id, data);
  return project ?? c.json({ error: "Project not found" }, 404);
});

export const DELETE = defineHandler.withValidator({
  params: projectsParamsSchema,
})(async (c, { params }) => {
  requirePermission(c, { projects: ["delete"] });
  const deleted = await projectsRepository.delete(params.id);
  return deleted ? null : c.json({ error: "Project not found" }, 404);
});
