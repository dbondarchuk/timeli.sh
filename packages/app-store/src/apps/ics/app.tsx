import { App } from "@vivid/types";
import { ICS_APP_NAME } from "./const";
import { IcsLogo } from "./logo";
import { IcsAppSetup } from "./setup";
import { IcsAdminKeys, IcsAdminNamespace } from "./translations/types";

export const IcsApp: App<IcsAdminNamespace, IcsAdminKeys> = {
  name: ICS_APP_NAME,
  displayName: "app_ics_admin.app.displayName",
  scope: ["calendar-read"],
  category: ["apps.categories.calendar"],
  type: "basic",
  Logo: ({ className }) => <IcsLogo className={className} />,
  SetUp: (props) => <IcsAppSetup {...props} />,
  isFeatured: true,
  description: {
    text: "app_ics_admin.app.description",
  },
};
