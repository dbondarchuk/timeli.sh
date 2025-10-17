import { App } from "@vivid/types";
import { ZOOM_APP_NAME } from "./const";
import { ZoomLogo } from "./logo";
import { ZoomAppSetup } from "./setup";
import { ZoomAdminKeys, ZoomAdminNamespace } from "./translations/types";

import image1 from "./images/image1.png";
import image2 from "./images/image2.png";

export const ZoomApp: App<ZoomAdminNamespace, ZoomAdminKeys> = {
  name: ZOOM_APP_NAME,
  displayName: "app_zoom_admin.app.displayName",
  scope: ["meeting-url-provider", "calendar-read", "appointment-hook"],
  type: "oauth",
  category: ["apps.categories.communications", "apps.categories.calendar"],
  Logo: ({ className }) => <ZoomLogo className={className} />,
  SetUp: (props) => <ZoomAppSetup {...props} />,
  isFeatured: true,
  description: {
    text: "app_zoom_admin.app.description",
    images: [image1.src, image2.src],
  },
};
