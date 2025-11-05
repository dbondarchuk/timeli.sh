import { App } from "@timelish/types";
import { SendHorizonal } from "lucide-react";
import { TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./const";
import {
  TextMessageNotificationAdminKeys,
  TextMessageNotificationAdminNamespace,
} from "./translations/types";

export const TextMessageNotificationApp: App<
  TextMessageNotificationAdminNamespace,
  TextMessageNotificationAdminKeys
> = {
  name: TEXT_MESSAGE_NOTIFICATION_APP_NAME,
  displayName: "app_text-message-notification_admin.app.displayName",
  scope: ["appointment-hook"],
  category: ["apps.categories.notifications"],
  type: "basic",
  Logo: ({ className }) => <SendHorizonal className={className} />,
  isFeatured: true,
  dontAllowMultiple: true,
  description: {
    text: "app_text-message-notification_admin.app.description",
  },
};
