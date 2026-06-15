import { Suspense } from "react";
import { FinancialsOverviewClient } from "./financials-overview-client";
import { FinancialsOverview } from "./financials-overview";
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

  return (
    <Suspense fallback={<FinancialsOverviewClient loading={true} />}>
      <FinancialsOverview key={key} searchParams={parsed} />
    </Suspense>
  );
}
