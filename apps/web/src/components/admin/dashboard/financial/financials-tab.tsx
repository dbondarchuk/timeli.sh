import { ServicesContainer } from "@vivid/services";
import React from "react";
import { FinancialsTabClient } from "./financials-tab-client";
import { searchParamsCache, serialize } from "./search-params";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const FinancialsTab: React.FC<Params> = async (props) => {
  // Get financial metrics and recent payments for initial load
  const paymentsService = ServicesContainer.PaymentsService();

  const searchParams = await props.searchParams;
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
  ] = await Promise.all([
    paymentsService.getFinancialMetrics(dateRange),
    // Intentionally not using date range for recent payments
    // Using 12 as it is easily divisible by 2, 3, 4, 6
    paymentsService.getRecentPayments(12),
    paymentsService.getRevenueOverTime(dateRange, timeGrouping),
    paymentsService.getServiceDistribution(dateRange),
    paymentsService.getCustomerData(dateRange, timeGrouping),
  ]);

  return (
    <FinancialsTabClient
      key={key}
      financialMetrics={financialMetrics}
      recentPayments={recentPayments}
      revenueOverTime={revenueOverTime}
      serviceDistribution={serviceDistribution}
      customerData={customerData}
      loading={false}
    />
  );
};
