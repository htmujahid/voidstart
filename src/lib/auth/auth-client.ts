import { passkeyClient } from "@better-auth/passkey/client";
import {
  emailOTPClient,
  lastLoginMethodClient,
  magicLinkClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { authConfigClient } from "./auth-config-client";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    passkeyClient(),
    lastLoginMethodClient({ cookieName: "last_login_method" }),
    authConfigClient(),
  ],
});
