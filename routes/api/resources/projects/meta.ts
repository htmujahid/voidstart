import { defineHandler } from "void";

import { requirePermission } from "@/lib/auth/access-server";
import { getTableMeta } from "@/lib/table-meta";
import { projectsMeta } from "@/resources/projects/projects.meta";
import { projects } from "@/resources/projects/projects.schema";

const meta = getTableMeta(projects, projectsMeta);

export const GET = defineHandler(async (c) => {
  requirePermission(c, { projects: ["list"] });
  return meta;
});
