import { App } from "@timelish/types";
import { BellRing } from "lucide-react";
import { APPOINTMENT_NOTIFICATIONS_APP_NAME } from "./const";
import {
  AppointmentNotificationsAdminKeys,
  AppointmentNotificationsAdminNamespace,
} from "./translations/types";

export const AppointmentNotificationsApp: App<
  AppointmentNotificationsAdminNamespace,
  AppointmentNotificationsAdminKeys
> = {
  name: APPOINTMENT_NOTIFICATIONS_APP_NAME,
  displayName: "app_appointment-notifications_admin.app.displayName",
  scope: ["scheduled", "appointment-hook"],
  type: "complex",
  category: ["apps.categories.notifications"],
  Logo: ({ className }) => <BellRing className={className} />,
  dontAllowMultiple: true,
  // isHidden: true,
  description: {
    text: "app_appointment-notifications_admin.app.description",
  },
  settingsHref: "communications/scheduled-notifications",
};
