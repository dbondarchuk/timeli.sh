import { App } from "@timelish/types";
import { ChartArea } from "lucide-react";
import { FINANCIAL_OVERVIEW_APP_NAME } from "./const";
import { FinancialOverviewAdminKeys } from "./translations/types";

export const FinancialOverviewApp: App<
  "app_financial-overview_admin",
  FinancialOverviewAdminKeys
> = {
  name: FINANCIAL_OVERVIEW_APP_NAME,
  displayName: "app_financial-overview_admin.app.displayName",
  scope: [],
  category: ["apps.categories.utilities"],
  type: "complex",
  dontAllowMultiple: true,
  isHidden: false,
  settingsHref: "financial-overview",
  Logo: ({ className }) => <ChartArea className={className} />,
  isFeatured: true,
  description: {
    text: "app_financial-overview_admin.app.description",
  },
};
