import { z } from "zod";
import { WithDatabaseId } from "../database";
import { Prettify } from "../utils/helpers";
import {
  AppointmentRequest,
  ModifyAppointmentRequest,
} from "./appointment-event";

export const paymentType = [
  "deposit",
  "rescheduleFee",
  "cancellationFee",
  "payment",
  "tips",
  "other",
] as const;

export type PaymentType = (typeof paymentType)[number];
export const paymentTypeSchema = z.enum(paymentType);

export const paymentFeeType = ["transaction", "platform", "other"] as const;
export type PaymentFeeType = (typeof paymentFeeType)[number];

export type PaymentFee = {
  type: PaymentFeeType;
  amount: number;
};

export type PaymentIntentStatus = "created" | "failed" | "paid";
export type PaymentIntentUpdateModel = {
  percentage: number;
  amount: number;
  customerId?: string;
  appId: string;
  appName: string;
  status: PaymentIntentStatus;
  appointmentId?: string;
  externalId?: string;
  error?: string;
  fees?: PaymentFee[];
} & (
  | {
      type: Exclude<PaymentType, "rescheduleFee">;
      request: AppointmentRequest;
    }
  | {
      type: Extract<PaymentType, "rescheduleFee">;
      request: ModifyAppointmentRequest;
    }
);

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

export const inPersonPaymentMethod = ["cash", "in-person-card"] as const;

export type PaymentStatus = "paid" | "refunded";
export type OnlinePaymentMethod = "online";
export type InPersonPaymentMethod = (typeof inPersonPaymentMethod)[number];

export type PaymentMethod = OnlinePaymentMethod | InPersonPaymentMethod;

export type PaymentUpdateModel = {
  amount: number;
  status: PaymentStatus;
  paidAt: Date;
  appointmentId: string;
  customerId: string;
  description: string;
  type: PaymentType;
  fees?: PaymentFee[];
  refunds?: {
    amount: number;
    refundedAt: Date;
  }[];
} & (
  | {
      method: InPersonPaymentMethod;
    }
  | {
      method: OnlinePaymentMethod;
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

export type OnlinePayment = Extract<Payment, { method: OnlinePaymentMethod }>;
export type InStorePayment = Extract<
  Payment,
  { method: InPersonPaymentMethod }
>;

export const inStorePaymentUpdateModelSchema = z.object({
  amount: z.coerce
    .number({ message: "payments.amount.min" })
    .min(1, "payments.amount.min"),
  paidAt: z.coerce.date({ message: "payments.paidAt.required" }),
  appointmentId: z.string(),
  description: z.string(),
  method: z.enum(inPersonPaymentMethod, {
    message: "payments.method.required",
  }),
  type: z.enum(paymentType, { message: "payments.type.required" }),
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
