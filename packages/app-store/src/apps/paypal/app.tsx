import { App } from "@vivid/types";
import { PAYPAL_APP_NAME } from "./const";
import { PaypalLogo } from "./logo";
import { PaypalAppSetup } from "./setup";
import { PaypalAdminKeys, PaypalAdminNamespace } from "./translations/types";

import image1 from "./images/1.png";

export const PaypalApp: App<PaypalAdminNamespace, PaypalAdminKeys> = {
  name: PAYPAL_APP_NAME,
  displayName: "app_paypal_admin.app.displayName",
  scope: ["payment"],
  type: "basic",
  category: ["apps.categories.payment"],
  Logo: ({ className }) => <PaypalLogo className={className} />,
  SetUp: (props) => <PaypalAppSetup {...props} />,
  isFeatured: true,
  description: {
    text: "app_paypal_admin.app.description",
    images: [image1.src],
  },
};
