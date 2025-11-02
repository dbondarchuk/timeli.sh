import { chainProxy } from "./proxy/chain-proxy";
import { withCompanyId } from "./proxy/with-company-id";
import { withLocale } from "./proxy/with-locale";
import { withLogger } from "./proxy/with-logger";

export const config = {
  runtime: "nodejs", // Now stable!
};

export default chainProxy([withCompanyId, withLogger, withLocale]);
