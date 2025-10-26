import { App } from "@vivid/types";
import { BellRing } from "lucide-react";
import { SCHEDULED_NOTIFICATIONS_APP_NAME } from "./const";
import {
  ScheduledNotificationsAdminKeys,
  ScheduledNotificationsAdminNamespace,
} from "./translations/types";

export const ScheduledNotificationsApp: App<
  ScheduledNotificationsAdminNamespace,
  ScheduledNotificationsAdminKeys
> = {
  name: SCHEDULED_NOTIFICATIONS_APP_NAME,
  displayName: "app_scheduled-notifications_admin.app.displayName",
  scope: ["scheduled", "appointment-hook"],
  type: "complex",
  category: ["apps.categories.notifications"],
  Logo: ({ className }) => <BellRing className={className} />,
  dontAllowMultiple: true,
  // isHidden: true,
  description: {
    text: "app_scheduled-notifications_admin.app.description",
  },
  settingsHref: "communications/scheduled-notifications",
};
