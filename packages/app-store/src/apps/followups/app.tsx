import type { App } from "@vivid/types";
import { MessageSquareHeart } from "lucide-react";
import { FOLLOW_UPS_APP_NAME } from "./const";
import {
  FollowUpsAdminKeys,
  FollowUpsAdminNamespace,
} from "./translations/types";

export const FollowUpsApp: App<FollowUpsAdminNamespace, FollowUpsAdminKeys> = {
  name: FOLLOW_UPS_APP_NAME,
  displayName: "app_follow-ups_admin.app.displayName",
  scope: ["scheduled"],
  type: "complex",
  category: ["apps.categories.notifications"],
  Logo: ({ className }) => <MessageSquareHeart className={className} />,
  dontAllowMultiple: true,
  description: {
    text: "app_follow-ups_admin.app.description",
  },
  settingsHref: "communications/follow-ups",
};
