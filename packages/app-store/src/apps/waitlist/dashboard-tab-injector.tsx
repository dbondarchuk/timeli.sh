import { DashboardTabInjectorApp } from "@vivid/types";
import {
  WaitlistAdminKeys,
  WaitlistAdminNamespace,
} from "./translations/types";
import { WaitlistTab } from "./views/waitlist-tab";

export const WaitlistNotificationDashboardTabInjector: DashboardTabInjectorApp<
  WaitlistAdminNamespace,
  WaitlistAdminKeys
> = {
  items: [
    {
      order: 100,
      href: "waitlist",
      label: "app_waitlist_admin.tab.title",
      notificationsCountKey: "waitlist.entries",
      view: (props) => <WaitlistTab {...props} />,
    },
  ],
};
