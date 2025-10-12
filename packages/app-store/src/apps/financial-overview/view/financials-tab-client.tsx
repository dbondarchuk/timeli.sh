"use client";

import { useI18n } from "@vivid/i18n";
import type {
  CustomerDataPoint,
  DateRange,
  FinancialMetrics,
  PaymentSummary,
  RevenueDataPoint,
  ServiceDataPoint,
} from "@vivid/types";
import {
  CalendarDateRangePicker,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@vivid/ui";
import { DateTime } from "luxon";
import { useQueryState } from "nuqs";
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// import { PaymentCard } from "@/components/payments/payment-card";
import {
  FinancialOverviewAdminKeys,
  FinancialOverviewAdminNamespace,
  financialOverviewAdminNamespace,
} from "../translations/types";
import { searchParams } from "./search-params";

const dateRangeOptions = [
  "thisMonth",
  "lastMonth",
  "thisWeek",
  "lastWeek",
  "thisYear",
  "lastYear",
  "allTime",
] as const;
type DateRangeOption = (typeof dateRangeOptions)[number];

const getDateRange = (option: DateRangeOption): DateRange | undefined => {
  const now = DateTime.now();

  switch (option) {
    case "thisMonth":
      return {
        start: now.startOf("month").toJSDate(),
        end: now.endOf("month").toJSDate(),
      };
    case "lastMonth":
      return {
        start: now.minus({ months: 1 }).startOf("month").toJSDate(),
        end: now.minus({ months: 1 }).endOf("month").toJSDate(),
      };
    case "thisWeek":
      return {
        start: now.startOf("week").toJSDate(),
        end: now.endOf("week").toJSDate(),
      };
    case "lastWeek":
      return {
        start: now.minus({ weeks: 1 }).startOf("week").toJSDate(),
        end: now.minus({ weeks: 1 }).endOf("week").toJSDate(),
      };
    case "thisYear":
      return {
        start: now.startOf("year").toJSDate(),
        end: now.endOf("year").toJSDate(),
      };
    case "lastYear":
      return {
        start: now.minus({ years: 1 }).startOf("year").toJSDate(),
        end: now.minus({ years: 1 }).endOf("year").toJSDate(),
      };
    case "allTime":
    default:
      return {
        start: now.minus({ years: 10 }).toJSDate(),
        end: now.plus({ years: 10 }).toJSDate(),
      };
  }
};

type FinancialsTabProps =
  | {
      financialMetrics: FinancialMetrics;
      recentPayments: PaymentSummary[];
      revenueOverTime: RevenueDataPoint[];
      serviceDistribution: ServiceDataPoint[];
      customerData: CustomerDataPoint[];
      loading?: false;
    }
  | {
      loading: true;
      financialMetrics?: never;
      recentPayments?: never;
      revenueOverTime?: never;
      serviceDistribution?: never;
      customerData?: never;
    };

const tooltipContentStyle = {
  backgroundColor: "hsl(var(--background))",
  color: "hsl(var(--foreground))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
};

export const FinancialsTabClient: React.FC<FinancialsTabProps> = ({
  financialMetrics,
  recentPayments,
  revenueOverTime,
  serviceDistribution,
  customerData,
  loading,
}) => {
  const t = useI18n<
    FinancialOverviewAdminNamespace,
    FinancialOverviewAdminKeys
  >(financialOverviewAdminNamespace);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatChartDate = (dateString: string) => {
    return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_SHORT);
  };

  const [start, setStart] = useQueryState(
    "start",
    searchParams.start.withOptions({ shallow: false }),
  );

  const [end, setEnd] = useQueryState(
    "end",
    searchParams.end.withOptions({ shallow: false }),
  );

  const [key, setKey] = useQueryState("key", {
    history: "replace",
    shallow: false,
  });

  const [timeGrouping, setTimeGrouping] = useQueryState(
    "timeGrouping",
    searchParams.timeGrouping.withOptions({ shallow: false }),
  );

  const handleCalendarChange = (range?: DateRange) => {
    setStart(range?.start || null);
    setEnd(range?.end || null);
  };

  // Format revenue data for charts
  const chartData = revenueOverTime?.map((point) => ({
    ...point,
    date: formatChartDate(point.date),
  }));

  const customerDataChart = customerData?.map((point) => ({
    ...point,
    date: formatChartDate(point.date),
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {/* Date Range Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between w-full">
          <h3 className="text-2xl font-semibold leading-none tracking-tight wrap-anywhere">
            {t("view.title")}
          </h3>
          <div className="flex flex-col md:flex-row gap-4 w-full md:max-w-fit">
            <div className="w-full md:w-48">
              <Select
                value={timeGrouping || "day"}
                onValueChange={(value) => setTimeGrouping(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("view.timeGrouping.label")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">
                    {t("view.timeGrouping.daily")}
                  </SelectItem>
                  <SelectItem value="week">
                    {t("view.timeGrouping.weekly")}
                  </SelectItem>
                  <SelectItem value="month">
                    {t("view.timeGrouping.monthly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:max-w-fit">
              <CalendarDateRangePicker
                range={{
                  start: start
                    ? DateTime.fromJSDate(start).toJSDate()
                    : undefined,
                  end: end ? DateTime.fromJSDate(end).toJSDate() : undefined,
                }}
                rangeOptions={dateRangeOptions.map((option) => ({
                  label: t(`view.rangeOptions.${option}`),
                  name: option,
                  value: getDateRange(option),
                }))}
                onChange={handleCalendarChange}
              />
            </div>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("view.estimatedRevenue")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="w-full h-10" />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialMetrics.estimatedRevenue)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("view.totalPayments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="w-full h-10" />
              ) : (
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(financialMetrics.totalPayments)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("view.netPayments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="w-full h-10" />
              ) : (
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(financialMetrics.netPayments)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("view.activeAppointments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="w-full h-10" />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  {financialMetrics.activeAppointments}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("view.declinedAppointments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="w-full h-10" />
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  {financialMetrics.declinedAppointments}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Revenue Over Time Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("view.revenueAndPayments")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(value, name) => [
                        formatCurrency(value as number),
                        name === "estimatedRevenue"
                          ? t("view.estimatedRevenue")
                          : name === "totalPayments"
                            ? t("view.totalPayments")
                            : name === "netPayments"
                              ? t("view.netPayments")
                              : name,
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="estimatedRevenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      name={t("view.estimatedRevenue")}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalPayments"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      name={t("view.totalPayments")}
                    />
                    <Line
                      type="monotone"
                      dataKey="netPayments"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      name={t("view.netPayments")}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Appointment Status Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("view.appointmentStatusDistribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(value, name) => [
                        value,
                        name === "activeAppointments"
                          ? t("view.activeAppointments")
                          : name === "declinedAppointments"
                            ? t("view.declinedAppointments")
                            : name,
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="activeAppointments"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                      name={t("view.activeAppointments")}
                    />
                    <Line
                      type="monotone"
                      dataKey="declinedAppointments"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 5 }}
                      name={t("view.declinedAppointments")}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("view.serviceDistribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      dataKey="count"
                      nameKey="serviceName"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ serviceName, count, revenue }) =>
                        `${serviceName}: ${count}`
                      }
                    >
                      {serviceDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(value, name, props) => (
                        <div className="flex flex-col text-foreground">
                          <span>
                            {t("view.appointmentsCount", {
                              count: value,
                            })}
                          </span>
                          <span>
                            {t("view.estimatedRevenueFormat", {
                              revenue: formatCurrency(props.payload.revenue),
                            })}
                          </span>
                        </div>
                      )}
                      labelFormatter={(label) => `${label}`}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Acquisition vs Retention Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("view.customerAcquisitionVsRetention")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <AreaChart data={customerDataChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(value, name) => [
                        value,
                        name === "newCustomers"
                          ? "New Customers"
                          : name === "returningCustomers"
                            ? "Returning Customers"
                            : name,
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="newCustomers"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="New Customers"
                    />
                    <Area
                      type="monotone"
                      dataKey="returningCustomers"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Returning Customers"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* <div className="flex flex-col gap-4 @container/recent-payments">
        <h3 className="text-2xl font-semibold leading-none tracking-tight wrap-anywhere">
          {t("dashboard.financials.recentPayments")}
        </h3>
        <div className="grid grid-col-1 @2xl/recent-payments:grid-cols-2 @4xl/recent-payments:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <Skeleton className="w-full h-80" key={index} />
            ))
          ) : recentPayments?.length > 0 ? (
            recentPayments.map((payment) => (
              <PaymentCard
                key={payment._id}
                payment={payment}
                onDelete={() => {
                  setKey(`${new Date().valueOf()}`);
                }}
              />
            ))
          ) : (
            <div className="w-full p-4 border rounded-md bg-card text-card-foreground flex items-center justify-center">
              <span className="text-foreground">
                {t("dashboard.financials.noPayments")}
              </span>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};
