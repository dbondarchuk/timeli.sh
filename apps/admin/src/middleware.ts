import { chainProxy } from "./proxy/chain-proxy";
import { withAuth } from "./proxy/with-auth";
import { withCsp } from "./proxy/with-csp";
import { withLocale } from "./proxy/with-locale";
import { withLogger } from "./proxy/with-logger";
import { withPolarWebhooks } from "./proxy/with-polar-webhooks";
import { withSubscriptionPlanGate } from "./proxy/with-subscription-plan-gate";

export const config = {
  runtime: "nodejs", // Now stable!
};

export default chainProxy([
  withLogger,
  withLocale,
  withPolarWebhooks,
  withAuth,
  withSubscriptionPlanGate,
  withCsp,
]);
