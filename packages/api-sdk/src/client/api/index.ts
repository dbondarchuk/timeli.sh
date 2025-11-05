import * as apps from "./apps";
import * as availability from "./availability";
import * as booking from "./booking";
import * as discounts from "./discounts";
import * as events from "./events";
import * as payments from "./payments";

export const clientApi = {
  availability,
  booking,
  discounts,
  payments,
  events,
  apps,
};

export * from "./utils";
