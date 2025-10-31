import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), organizationClient()],
  /** The base URL of the server (optional if you're using the same domain) */
  //   baseURL: "http://localhost:3000",
});
