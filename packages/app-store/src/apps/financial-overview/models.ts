import { Payment } from "@vivid/types";

export type PaymentSummary = Payment & {
  customerName?: string;
  serviceName?: string;
};

export type FinancialMetrics = {
  estimatedRevenue: number;
  totalPayments: number;
  netPayments: number;
  activeAppointments: number;
  declinedAppointments: number;
};

export type RevenueDataPoint = {
  date: string;
  estimatedRevenue: number;
  totalPayments: number;
  netPayments: number;
  activeAppointments: number;
  declinedAppointments: number;
};

export type ServiceDataPoint = {
  serviceName: string;
  count: number;
  revenue: number;
};

export type CustomerDataPoint = {
  date: string;
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
};

export type TimeGrouping = "day" | "week" | "month";
