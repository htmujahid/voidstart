import { defineHandler } from "void";
import { storage } from "void/storage";

export const GET = defineHandler(async (c) => {
  const object = await storage.get(`avatars/${c.req.param("userId")}/${c.req.param("file")}`);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Disposition", "attachment");

  return new Response(object.body, { headers });
});
