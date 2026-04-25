import { chainProxy } from "./proxy/chain-proxy";
import { withAuth } from "./proxy/with-auth";
import { withLocale } from "./proxy/with-locale";
import { withLogger } from "./proxy/with-logger";
import { withPolarWebhooks } from "./proxy/with-polar-webhooks";

export const config = {
  runtime: "nodejs", // Now stable!
};

export default chainProxy([
  withLogger,
  withLocale,
  withPolarWebhooks,
  withAuth,
]);
