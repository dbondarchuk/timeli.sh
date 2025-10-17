import { App } from "@vivid/types";
import { URL_BUSY_EVENTS_APP_NAME } from "./const";
import { UrlBusyEventsLogo } from "./logo";
import { UrlBusyEventsAppSetup } from "./setup";
import {
  UrlBusyEventsAdminKeys,
  UrlBusyEventsAdminNamespace,
} from "./translations/types";

export const UrlBusyEventsApp: App<
  UrlBusyEventsAdminNamespace,
  UrlBusyEventsAdminKeys
> = {
  name: URL_BUSY_EVENTS_APP_NAME,
  displayName: "app_url-busy-events_admin.app.displayName",
  scope: ["calendar-read"],
  category: ["apps.categories.calendar"],
  type: "basic",
  Logo: ({ className }) => <UrlBusyEventsLogo className={className} />,
  SetUp: (props) => <UrlBusyEventsAppSetup {...props} />,
  description: {
    text: "app_url-busy-events_admin.app.description",
  },
};
