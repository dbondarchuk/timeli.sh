import { App } from "@vivid/types";
import { BellRing } from "lucide-react";
import { REMINDERS_APP_NAME } from "./const";
import {
  RemindersAdminKeys,
  RemindersAdminNamespace,
} from "./translations/types";

export const RemindersApp: App<RemindersAdminNamespace, RemindersAdminKeys> = {
  name: REMINDERS_APP_NAME,
  displayName: "app_reminders_admin.app.displayName",
  scope: ["scheduled"],
  type: "complex",
  category: ["apps.categories.notifications"],
  Logo: ({ className }) => <BellRing className={className} />,
  dontAllowMultiple: true,
  // isHidden: true,
  description: {
    text: "app_reminders_admin.app.description",
  },
  settingsHref: "communications/reminders",
};
