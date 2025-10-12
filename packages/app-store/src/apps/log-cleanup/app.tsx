import { App } from "@vivid/types";
import { MessageCircleX } from "lucide-react";
import { LOG_CLEANUP_APP_NAME } from "./const";
import { LogCleanupAppSetup } from "./setup";
import {
  LogCleanupAdminKeys,
  LogCleanupAdminNamespace,
} from "./translations/types";

export const LogCleanupApp: App<LogCleanupAdminNamespace, LogCleanupAdminKeys> =
  {
    name: LOG_CLEANUP_APP_NAME,
    displayName: "app_log-cleanup_admin.app.displayName",
    scope: ["scheduled"],
    category: ["apps.categories.utilities"],
    type: "basic",
    Logo: ({ className }) => <MessageCircleX className={className} />,
    SetUp: (props) => <LogCleanupAppSetup {...props} />,
    isFeatured: false,
    dontAllowMultiple: true,
    description: {
      text: "app_log-cleanup_admin.app.description",
    },
  };
