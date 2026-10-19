import { defineEnv, string } from "void/env";

import { DEFAULT_APP_NAME } from "./src/lib/app.ts";

export default defineEnv({
  APP_NAME: string().default(DEFAULT_APP_NAME),
  // Comma-separated extra origins allowed to use auth (e.g. https://a.com,myapp://)
  TRUSTED_ORIGINS: string().optional(),
});
