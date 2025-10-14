import { App } from "@vivid/types";
import { WebhooksLogo } from "./logo";
import { WebhooksAppSetup } from "./setup";
import {
  WebhooksAdminKeys,
  WebhooksAdminNamespace,
} from "./translations/types";

export const webhooksApp: App<WebhooksAdminNamespace, WebhooksAdminKeys> = {
  name: "webhooks",
  displayName: "app_webhooks_admin.app.displayName",
  category: ["apps.categories.notifications"],
  scope: ["appointment-hook", "customer-hook", "payment-hook", "waitlist-hook"],
  description: {
    text: "app_webhooks_admin.app.description",
    images: [],
  },
  Logo: WebhooksLogo,
  isFeatured: false,
  type: "basic",
  dontAllowMultiple: false,
  SetUp: (props) => <WebhooksAppSetup {...props} />,
};
