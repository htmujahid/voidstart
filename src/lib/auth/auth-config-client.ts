import type { BetterAuthClientPlugin } from "better-auth";

import type { authConfigPlugin } from "./auth-config-plugin";

export const authConfigClient = () =>
  ({
    id: "config",
    $InferServerPlugin: {} as ReturnType<typeof authConfigPlugin>,
    pathMethods: { "/config": "GET" },
  }) satisfies BetterAuthClientPlugin;
