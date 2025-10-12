import { App } from "@vivid/types";
import { ChartArea } from "lucide-react";
import { FINANCIAL_OVERVIEW_APP_NAME } from "./const";
import { FinancialOverviewAppSetup } from "./setup";
import { FinancialOverviewAdminKeys } from "./translations/types";

import image1 from "./images/image.png";

export const FinancialOverviewApp: App<
  "app_financial-overview_admin",
  FinancialOverviewAdminKeys
> = {
  name: FINANCIAL_OVERVIEW_APP_NAME,
  displayName: "app_financial-overview_admin.app.displayName",
  scope: ["dashboard-tab"],
  category: ["apps.categories.utilities"],
  type: "basic",
  dontAllowMultiple: true,
  Logo: ({ className }) => <ChartArea className={className} />,
  SetUp: (props) => <FinancialOverviewAppSetup {...props} />,
  isFeatured: true,
  description: {
    text: "app_financial-overview_admin.app.description",
    images: [image1.src],
  },
};
