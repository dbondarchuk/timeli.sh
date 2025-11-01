import { chainMiddleware } from "./middleware/chainMiddleware";
import { withAuth } from "./middleware/withAuth";
import { withLocale } from "./middleware/withLocale";
import { withLogger } from "./middleware/withLogger";

export default chainMiddleware([withLogger, withLocale, withAuth]);
