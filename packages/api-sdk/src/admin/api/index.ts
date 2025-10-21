import * as appointments from "./appointments";
import * as apps from "./apps";
import * as assets from "./assets";
import * as calendar from "./calendar";
import * as communicationLogs from "./communication-logs";
import * as communications from "./communications";
import * as customers from "./customers";
import * as discounts from "./discounts";
import * as pageFooters from "./page-footers";
import * as pageHeaders from "./page-headers";
import * as pages from "./pages";
import * as payments from "./payments";
import * as schedule from "./schedule";
import * as serviceAddons from "./service-addons";
import * as serviceFields from "./service-fields";
import * as serviceOptions from "./service-options";
import * as templates from "./templates";

export const adminApi = {
  calendar,
  appointments,
  assets,
  payments,
  communications,
  communicationLogs,
  templates,
  discounts,
  pages,
  pageHeaders,
  pageFooters,
  customers,
  serviceAddons,
  serviceFields,
  serviceOptions,
  schedule,
  apps,
};

export * from "./utils";
