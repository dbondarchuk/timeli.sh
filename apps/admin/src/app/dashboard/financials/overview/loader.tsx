import { DateTime } from "luxon";
import { Suspense } from "react";
import { FinancialsOverview } from "./financials-overview";
import { FinancialsOverviewClient } from "./financials-overview-client";
import {
  financialOverviewSearchParamsCache,
  serializeFinancialOverviewSearchParams,
} from "./search-params";

type FinancialsOverviewLoaderProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function FinancialsOverviewLoader({
  searchParams,
}: FinancialsOverviewLoaderProps) {
  const parsed = financialOverviewSearchParamsCache.parse(searchParams);
  const key = serializeFinancialOverviewSearchParams({ ...parsed });

  // Default to current month if no start or end date is provided
  // This is done here and not in the search-params.ts file because
  // if deployment was done in last month, server will keep the last month's dates for default
  const params = {
    ...parsed,
    start: parsed.start || DateTime.now().startOf("month").toJSDate(),
    end: parsed.end || DateTime.now().endOf("month").toJSDate(),
  };

  return (
    <Suspense fallback={<FinancialsOverviewClient loading={true} />}>
      <FinancialsOverview key={key} searchParams={params} />
    </Suspense>
  );
}
