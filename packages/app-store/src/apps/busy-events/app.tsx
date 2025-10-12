import { App } from "@vivid/types";
import { CalendarX2 } from "lucide-react";
import { BUSY_EVENTS_APP_NAME } from "./const";
import {
  BusyEventsAdminKeys,
  BusyEventsAdminNamespace,
} from "./translations/types";

export const BusyEventsApp: App<BusyEventsAdminNamespace, BusyEventsAdminKeys> =
  {
    name: BUSY_EVENTS_APP_NAME,
    displayName: "app_busy-events_admin.app.displayName",
    scope: ["calendar-read"],
    type: "complex",
    category: ["apps.categories.schedule"],
    Logo: ({ className }) => <CalendarX2 className={className} />,
    isFeatured: true,
    dontAllowMultiple: true,
    description: {
      text: "app_busy-events_admin.app.description",
    },
    settingsHref: "settings/schedule/busy-events",
  };
