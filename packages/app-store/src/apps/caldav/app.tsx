import { App } from "@vivid/types";
import { CALDAV_APP_NAME } from "./const";
import image from "./images/image.png";
import { CaldavLogo } from "./logo";
import { CaldavAppSetup } from "./setup";
import { CaldavAdminKeys, CaldavAdminNamespace } from "./translations/types";

export const CaldavApp: App<CaldavAdminNamespace, CaldavAdminKeys> = {
  name: CALDAV_APP_NAME,
  displayName: "app_caldav_admin.app.displayName",
  category: ["apps.categories.schedule"],
  scope: ["calendar-read", "calendar-write"],
  type: "basic",
  Logo: ({ className }) => <CaldavLogo className={className} />,
  SetUp: (props) => <CaldavAppSetup {...props} />,
  isFeatured: true,
  description: {
    text: "app_caldav_admin.app.description",
    images: [image.src],
  },
};
