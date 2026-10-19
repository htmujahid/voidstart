import { HTTPException } from "hono/http-exception";

export const conflictError = (message: string) =>
  new HTTPException(409, {
    message,
    res: Response.json({ error: message }, { status: 409 }),
  });

export const notFoundError = (message: string) =>
  new HTTPException(404, {
    message,
    res: Response.json({ error: message }, { status: 404 }),
  });

export const forbiddenError = (message: string) =>
  new HTTPException(403, {
    message,
    res: Response.json({ error: message }, { status: 403 }),
  });
