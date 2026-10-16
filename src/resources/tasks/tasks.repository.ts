import { db, desc, eq } from 'void/db';
import { tasks, type NewTask, type Task } from './tasks.schema';

export const tasksRepository = {
  async findAll(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.id));
  },

  async findById(id: number): Promise<Task | undefined> {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return row;
  },

  async create(data: Omit<NewTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const [row] = await db.insert(tasks).values(data).returning();
    return row;
  },

  async update(
    id: number,
    data: Partial<Omit<NewTask, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Task | undefined> {
    const [row] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    return row;
  },

  async delete(id: number): Promise<boolean> {
    const rows = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
    return rows.length > 0;
  },
};
