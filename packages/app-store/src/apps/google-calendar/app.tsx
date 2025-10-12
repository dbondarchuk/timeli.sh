import { App } from "@vivid/types";
import { GOOGLE_CALENDAR_APP_NAME } from "./const";
import { GoogleCalendarLogo } from "./logo";
import { GoogleAppSetup } from "./setup";
import {
  GoogleCalendarAdminKeys,
  GoogleCalendarAdminNamespace,
} from "./translations/types";

import image1 from "./images/1.png";
import image2 from "./images/2.png";

export const GoogleCalendarApp: App<
  GoogleCalendarAdminNamespace,
  GoogleCalendarAdminKeys
> = {
  name: GOOGLE_CALENDAR_APP_NAME,
  displayName: "app_google-calendar_admin.app.displayName",
  scope: ["calendar-read", "calendar-write"],
  type: "oauth",
  category: ["apps.categories.calendar", "apps.categories.communications"],
  Logo: ({ className }) => <GoogleCalendarLogo className={className} />,
  SetUp: (props) => <GoogleAppSetup {...props} />,
  isFeatured: true,
  description: {
    text: "app_google-calendar_admin.app.description",
    images: [image1.src, image2.src],
  },
};
