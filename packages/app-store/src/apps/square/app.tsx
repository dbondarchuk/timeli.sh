import { App } from "@timelish/types";
import { SQUARE_APP_NAME } from "./const";
import { SquareLogo } from "./logo";
import { SquareAdminKeys, SquareAdminNamespace } from "./translations/types";

export const SquareApp: App<SquareAdminNamespace, SquareAdminKeys> = {
  name: SQUARE_APP_NAME,
  displayName: "app_square_admin.app.displayName",
  scope: ["payment"],
  type: "oauth",
  category: ["apps.categories.payment"],
  Logo: ({ className }) => <SquareLogo className={className} />,
  isFeatured: true,
  description: {
    text: "app_square_admin.app.description",
  },
};
