import { IConnectedAppProps } from "@timelish/types";
import React from "react";
import FinancialOverviewService from "../repository-service";
import { FinancialsTabClient } from "./financials-tab-client";
import { searchParamsCache, serialize } from "./search-params";

export const FinancialsTab: React.FC<{
  searchParams: { [key: string]: string | string[] | undefined };
  props: IConnectedAppProps;
}> = async ({ searchParams, props }) => {
  // Get financial metrics and recent payments for initial load
  const paymentsService = new FinancialOverviewService(
    props.companyId,
    props.getDbConnection,
    props.services,
  );

  const parsed = searchParamsCache.parse(searchParams);
  const key = serialize({ ...parsed });

  const dateRange = {
    start: parsed.start || undefined,
    end: parsed.end || undefined,
  };

  const timeGrouping =
    (parsed.timeGrouping as "day" | "week" | "month") || "day";

  const [
    financialMetrics,
    recentPayments,
    revenueOverTime,
    serviceDistribution,
    customerData,
    bookingStats,
    abandonmentBookingStepBreakdown,
    bookingStatsOverTime,
    bookingConversionStats,
  ] = await Promise.all([
    paymentsService.getFinancialMetrics(dateRange),
    // Intentionally not using date range for recent payments
    // Using 12 as it is easily divisible by 2, 3, 4, 6
    paymentsService.getRecentPayments(12),
    paymentsService.getRevenueOverTime(dateRange, timeGrouping),
    paymentsService.getServiceDistribution(dateRange),
    paymentsService.getCustomerData(dateRange, timeGrouping),
    paymentsService.getBookingCompletionStats(dateRange),
    paymentsService.getAbandonmentBookingStepBreakdown(dateRange),
    paymentsService.getBookingStatsOverTime(dateRange, timeGrouping),
    paymentsService.getBookingConversionStats(dateRange),
  ]);

  return (
    <FinancialsTabClient
      key={key}
      financialMetrics={financialMetrics}
      recentPayments={recentPayments}
      revenueOverTime={revenueOverTime}
      serviceDistribution={serviceDistribution}
      customerData={customerData}
      bookingStats={bookingStats}
      abandonmentBookingStepBreakdown={abandonmentBookingStepBreakdown}
      bookingStatsOverTime={bookingStatsOverTime}
      bookingConversionStats={bookingConversionStats}
      loading={false}
    />
  );
};
