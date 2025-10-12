import { DashboardTabInjectorApp } from "@vivid/types";
import { FINANCIAL_OVERVIEW_APP_NAME } from "../apps/financial-overview/const";
import { FinancialOverviewDashboardTabInjector } from "../apps/financial-overview/injectorts";
import { WAITLIST_APP_NAME } from "../apps/waitlist/const";
import { WaitlistNotificationDashboardTabInjector } from "../apps/waitlist/dashboard-tab-injector";

export const DashboardTabInjectorApps: Record<string, DashboardTabInjectorApp> =
  {
    [WAITLIST_APP_NAME]: WaitlistNotificationDashboardTabInjector,
    [FINANCIAL_OVERVIEW_APP_NAME]: FinancialOverviewDashboardTabInjector,
  };
