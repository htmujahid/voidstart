import { createAuthClient } from "better-auth/react";

import { authConfigClient } from "./auth-config-client";

export const authClient = createAuthClient({
  plugins: [authConfigClient()],
});
