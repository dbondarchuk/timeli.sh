import { chainProxy } from "./proxy/chain-proxy";
import { withLocale } from "./proxy/with-locale";
import { withLogger } from "./proxy/with-logger";
import { withOrganizationId } from "./proxy/with-organization-id";

export const config = {
  runtime: "nodejs", // Now stable!
};

export default chainProxy([withOrganizationId, withLogger, withLocale]);
