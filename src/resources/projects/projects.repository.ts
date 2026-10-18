import { db, desc, eq } from "void/db";

import { projects, type NewProject, type Project } from "./projects.schema";

export const projectsRepository = {
  async findAll(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.id));
  },

  async findById(id: number): Promise<Project | undefined> {
    const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return row;
  },

  async findBySlug(slug: string): Promise<Project | undefined> {
    const [row] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    return row;
  },

  async create(data: Omit<NewProject, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const [row] = await db.insert(projects).values(data).returning();
    return row;
  },

  async update(
    id: number,
    data: Partial<Omit<NewProject, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Project | undefined> {
    const [row] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    return row;
  },

  async delete(id: number): Promise<boolean> {
    const rows = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    return rows.length > 0;
  },
};
