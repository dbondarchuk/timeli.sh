import { ComplexAppPageProps } from "@timelish/types";
import { Suspense } from "react";
import { FinancialsTab } from "../view/financials-tab";
import { FinancialsTabClient } from "../view/financials-tab-client";

export async function FinancialOverviewPage({
  searchParams,
  appId,
  services,
}: ComplexAppPageProps) {
  const connectedAppProps =
    await services.connectedAppsService.getAppServiceProps(appId);

  return (
    <Suspense fallback={<FinancialsTabClient loading={true} />}>
      <FinancialsTab
        searchParams={searchParams ?? {}}
        props={connectedAppProps}
      />
    </Suspense>
  );
}
