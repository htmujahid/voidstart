import { notFoundError } from "@/lib/errors";

import { projectsRepository } from "../projects/projects.repository";
import type { NewTask } from "./tasks.schema";

type TaskInput = Omit<NewTask, "id" | "createdAt" | "updatedAt">;

async function assertProjectExists(projectId: number | null | undefined) {
  if (projectId == null) return;
  if (!(await projectsRepository.findById(projectId))) throw notFoundError("Project not found");
}

export const tasksHooks = {
  async beforeCreate(data: TaskInput) {
    await assertProjectExists(data.projectId);
    return data;
  },

  async beforeUpdate(_id: number, data: Partial<TaskInput>) {
    await assertProjectExists(data.projectId);
    return data;
  },
};
