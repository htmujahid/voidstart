import { emailOTPClient, magicLinkClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { authConfigClient } from "./auth-config-client";

export const authClient = createAuthClient({
  plugins: [usernameClient(), magicLinkClient(), emailOTPClient(), authConfigClient()],
});
