import { BaseAllKeys } from "@timelish/i18n";
import { AppMenuItem } from "@timelish/types";
import { ChartArea } from "lucide-react";
import { FinancialOverviewPage } from "./pages/overview";
import {
  FinancialOverviewAdminKeys,
  FinancialOverviewAdminNamespace,
} from "./translations/types";

export const FinancialOverviewMenuItems: AppMenuItem<
  FinancialOverviewAdminNamespace,
  FinancialOverviewAdminKeys
>[] = [
  {
    href: "financial-overview",
    id: "financials-overview",
    group: "financials",
    order: 100,
    notScrollable: false,
    hideHeading: true,
    label: "app_financial-overview_admin.navigation.overview",
    pageTitle: "app_financial-overview_admin.view.title",
    icon: <ChartArea />,
    Page: FinancialOverviewPage,
    noAppsBreadcrumb: true,
    pageBreadcrumbs: [
      {
        title: "admin.navigation.financials" satisfies BaseAllKeys as any,
        link: "/dashboard/financials/payments",
      },
      {
        title: "app_financial-overview_admin.navigation.overview",
        link: "/dashboard/financial-overview",
      },
    ],
  },
];
