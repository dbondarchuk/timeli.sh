import { z } from "zod";
import { WithDatabaseId } from "../database";
import { Prettify } from "../utils/helpers";
import { AppointmentRequest } from "./appointment-event";

export type PaymentIntentStatus = "created" | "failed" | "paid";
export type PaymentIntentUpdateModel = {
  percentage: number;
  amount: number;
  customerId?: string;
  appId: string;
  appName: string;
  status: PaymentIntentStatus;
  appointmentId?: string;
  request: AppointmentRequest;
  externalId?: string;
  error?: string;
};

export type PaymentIntent = WithDatabaseId<
  PaymentIntentUpdateModel & {
    createdAt: Date;
    updatedAt: Date;
    paidAt?: Date;
  }
>;

export type CollectPayment = {
  formProps: Record<string, any>;
  intent: Omit<PaymentIntent, "request">;
};

export const inPersonPaymentType = ["cash", "in-person-card"] as const;

export type PaymentStatus = "paid" | "refunded";
export type OnlinePaymentType = "online";
export type InPersonPaymentType = (typeof inPersonPaymentType)[number];

export type PaymentType = OnlinePaymentType | InPersonPaymentType;

export type PaymentUpdateModel = {
  amount: number;
  status: PaymentStatus;
  paidAt: Date;
  appointmentId: string;
  customerId: string;
  description: string;
  refunds?: {
    amount: number;
    refundedAt: Date;
  }[];
} & (
  | {
      type: InPersonPaymentType;
    }
  | {
      type: OnlinePaymentType;
      intentId: string;
      externalId?: string;
      appName: string;
      appId: string;
    }
);

export type Payment = Prettify<
  WithDatabaseId<
    PaymentUpdateModel & {
      updatedAt: Date;
    }
  >
>;

export const inStorePaymentUpdateModelSchema = z.object({
  amount: z.coerce
    .number({ message: "payments.amount.min" })
    .min(1, "payments.amount.min"),
  paidAt: z.coerce.date({ message: "payments.paidAt.required" }),
  appointmentId: z.string(),
  description: z.string(),
  type: z.enum(inPersonPaymentType, { message: "payments.type.required" }),
});

export type InStorePaymentUpdateModel = z.infer<
  typeof inStorePaymentUpdateModelSchema
>;

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
