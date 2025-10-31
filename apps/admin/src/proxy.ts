import { chainProxy } from "./proxy/chain-proxy";
import { withAuth } from "./proxy/with-auth";
import { withLocale } from "./proxy/with-locale";
import { withLogger } from "./proxy/with-logger";

export default chainProxy([withLogger, withLocale, withAuth]);
