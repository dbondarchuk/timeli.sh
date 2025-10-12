import { DashboardTabInjectorApp } from "@vivid/types";
import { FinancialOverviewAdminKeys } from "./translations/types";
import { FinancialsTab } from "./view/financials-tab";

export const FinancialOverviewDashboardTabInjector: DashboardTabInjectorApp<
  "app_financial-overview_admin",
  FinancialOverviewAdminKeys
> = {
  items: [
    {
      order: 100,
      href: "financials",
      label: "app_financial-overview_admin.tab.title",
      view: (props) => <FinancialsTab {...props} />,
    },
  ],
};
