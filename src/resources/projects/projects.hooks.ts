import { conflictError } from "@/lib/errors";

import { projectsRepository } from "./projects.repository";
import type { NewProject } from "./projects.schema";

type ProjectInput = Omit<NewProject, "id" | "createdAt" | "updatedAt">;

async function assertSlugAvailable(slug: string, exceptId?: number) {
  const existing = await projectsRepository.findBySlug(slug);
  if (existing && existing.id !== exceptId) throw conflictError("Slug already in use");
}

export const projectsHooks = {
  async beforeCreate(data: ProjectInput) {
    await assertSlugAvailable(data.slug);
    return data;
  },

  async beforeUpdate(id: number, data: Partial<ProjectInput>) {
    if (data.slug) await assertSlugAvailable(data.slug, id);
    return data;
  },
};
