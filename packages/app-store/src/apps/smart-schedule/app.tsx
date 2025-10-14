import { App } from "@vivid/types";
import { SMART_SCHEDULE_APP_NAME } from "./const";
import { SmartScheduleLogo } from "./logo";
import { SmartScheduleAppSetup } from "./setup";
import {
  SmartScheduleAdminKeys,
  SmartScheduleAdminNamespace,
} from "./translations/types";

export const SmartScheduleApp: App<
  SmartScheduleAdminNamespace,
  SmartScheduleAdminKeys
> = {
  name: SMART_SCHEDULE_APP_NAME,
  displayName: "app_smart-schedule_admin.app.displayName",
  scope: ["availability-provider"],
  category: ["apps.categories.schedule"],
  type: "basic",
  Logo: ({ className }) => <SmartScheduleLogo className={className} />,
  SetUp: (props) => <SmartScheduleAppSetup {...props} />,
  description: {
    text: "app_smart-schedule_admin.app.description",
  },
};
