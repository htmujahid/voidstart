import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { storage } from "void/storage";

const MAX_SIZE = 2 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function removeAvatars(userId: string, keep?: string) {
  const prefix = `avatars/${userId}/`;
  const { objects } = await storage.list({ prefix });
  const keys = objects.map((object) => object.key).filter((key) => key !== keep);
  if (keys.length > 0) await storage.delete(keys);
}

export const POST = defineHandler(async (c) => {
  const user = requireAuth(c);
  const form = await c.req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) return c.json({ error: "Choose an image to upload." }, 400);

  const extension = EXTENSIONS[file.type];
  if (!extension) return c.json({ error: "Use a PNG, JPG, WebP or GIF image." }, 415);
  if (file.size > MAX_SIZE) return c.json({ error: "The image must be 2 MB or smaller." }, 413);

  const key = `avatars/${user.id}/${crypto.randomUUID()}.${extension}`;
  await storage.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  await removeAvatars(user.id, key);

  return { url: `/api/${key}` };
});

export const DELETE = defineHandler(async (c) => {
  const user = requireAuth(c);
  await removeAvatars(user.id);
  return null;
});
