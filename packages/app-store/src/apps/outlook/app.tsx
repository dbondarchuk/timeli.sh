import { App } from "@vivid/types";
import { OUTLOOK_APP_NAME } from "./const";
import { OutlookLogo } from "./logo";
import { OutlookAppSetup } from "./setup";
import { OutlookAdminKeys, OutlookAdminNamespace } from "./translations/types";

import image1 from "./images/1.jpg";
import image2 from "./images/2.jpg";
import image3 from "./images/3.jpg";
import image4 from "./images/4.jpg";

export const OutlookApp: App<OutlookAdminNamespace, OutlookAdminKeys> = {
  name: OUTLOOK_APP_NAME,
  displayName: "app_outlook_admin.app.displayName",
  scope: [
    "calendar-read",
    "calendar-write",
    "mail-send",
    "meeting-url-provider",
  ],
  type: "oauth",
  category: ["apps.categories.calendar", "apps.categories.communications"],
  Logo: ({ className }) => <OutlookLogo className={className} />,
  SetUp: (props) => <OutlookAppSetup {...props} />,
  isFeatured: true,
  description: {
    text: "app_outlook_admin.app.description",
    images: [image1.src, image2.src, image3.src, image4.src],
  },
};
