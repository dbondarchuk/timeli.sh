import { App } from "@vivid/types";
import { SendHorizonal } from "lucide-react";
import { TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./const";
import { TextMessageNotificationAppSetup } from "./setup";
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
  SetUp: (props) => <TextMessageNotificationAppSetup {...props} />,
  isFeatured: true,
  dontAllowMultiple: true,
  description: {
    text: "app_text-message-notification_admin.app.description",
  },
};
