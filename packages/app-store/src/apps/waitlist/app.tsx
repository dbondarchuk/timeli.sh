import { App } from "@vivid/types";
import { CalendarClock } from "lucide-react";
import { WAITLIST_APP_NAME } from "./const";
import { WaitlistAdminKeys } from "./translations/types";

import image1 from "./images/1.png";
import image2 from "./images/2.png";
import image3 from "./images/3.png";

export const WaitlistApp: App<"app_waitlist_admin", WaitlistAdminKeys> = {
  name: WAITLIST_APP_NAME,
  displayName: "app_waitlist_admin.app.displayName",
  category: ["apps.categories.appointments"],
  scope: [
    "dashboard-tab",
    "ui-components",
    "waitlist",
    "appointment-hook",
    "dashboard-notifier",
  ],
  type: "complex",
  Logo: ({ className }) => <CalendarClock className={className} />,
  // SetUp: (props) => <WaitlistNotificationAppSetup {...props} />,
  isFeatured: true,
  isHidden: false,
  dontAllowMultiple: true,
  description: {
    text: "app_waitlist_admin.app.description",
    images: [image1.src, image2.src, image3.src],
  },
  settingsHref: "waitlist",
};
