import {
  CustomerDataPoint,
  FinancialMetrics,
  Payment,
  PaymentIntent,
  PaymentIntentUpdateModel,
  PaymentSummary,
  PaymentUpdateModel,
  RevenueDataPoint,
  ServiceDataPoint,
  TimeGrouping,
} from "../booking";
import { DateRange } from "../general";

export interface IPaymentsService {
  createIntent(
    intent: Omit<PaymentIntentUpdateModel, "status">,
  ): Promise<PaymentIntent>;

  getIntent(id: string): Promise<PaymentIntent | null>;
  getIntentByExternalId(externalId: string): Promise<PaymentIntent | null>;

  updateIntent(
    id: string,
    update: Partial<PaymentIntentUpdateModel>,
  ): Promise<PaymentIntent>;

  createPayment(payment: PaymentUpdateModel): Promise<Payment>;

  getPayment(id: string): Promise<Payment | null>;

  updatePayment(
    id: string,
    update: Partial<PaymentUpdateModel>,
  ): Promise<Payment>;

  deletePayment(id: string): Promise<Payment | null>;

  refundPayment(
    id: string,
    amount: number,
  ): Promise<
    | { success: false; error: string; status: number }
    | { success: true; updatedPayment: Payment }
  >;

  // Financials

  getFinancialMetrics(dateRange?: DateRange): Promise<FinancialMetrics>;
  getRecentPayments(
    limit?: number,
    dateRange?: DateRange,
  ): Promise<PaymentSummary[]>;
  getRevenueOverTime(
    dateRange?: DateRange,
    timeGrouping?: TimeGrouping,
  ): Promise<RevenueDataPoint[]>;
  getServiceDistribution(dateRange?: DateRange): Promise<ServiceDataPoint[]>;
  getCustomerData(
    dateRange?: DateRange,
    timeGrouping?: TimeGrouping,
  ): Promise<CustomerDataPoint[]>;
}
