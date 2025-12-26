import * as z from "zod";
import { WithCompanyId, WithDatabaseId } from "../database";
import { Prettify } from "../utils/helpers";
import {
  AppointmentRequest,
  appointmentRequestSchema,
  ModifyAppointmentRequest,
  modifyAppointmentRequestSchema,
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
      type: Extract<PaymentType, "rescheduleFee" | "cancellationFee">;
      request: ModifyAppointmentRequest;
    }
);

export const createOrUpdatePaymentIntentRequestSchema = z.discriminatedUnion(
  "type",
  [
    z.object({
      type: paymentTypeSchema.exclude(["rescheduleFee", "cancellationFee"]),
      request: appointmentRequestSchema,
    }),
    z.object({
      type: paymentTypeSchema.extract(["rescheduleFee", "cancellationFee"]),
      request: modifyAppointmentRequestSchema,
    }),
  ],
);

export type CreateOrUpdatePaymentIntentRequest = z.infer<
  typeof createOrUpdatePaymentIntentRequestSchema
>;

export type PaymentIntent = Prettify<
  WithCompanyId<
    WithDatabaseId<
      PaymentIntentUpdateModel & {
        createdAt: Date;
        updatedAt: Date;
        paidAt?: Date;
      }
    >
  >
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
  WithCompanyId<
    WithDatabaseId<
      PaymentUpdateModel & {
        updatedAt: Date;
      }
    >
  >
>;

export type OnlinePayment = Extract<Payment, { method: OnlinePaymentMethod }>;
export type InStorePayment = Extract<
  Payment,
  { method: InPersonPaymentMethod }
>;

export const inStorePaymentUpdateModelSchema = z.object({
  amount: z.coerce
    .number<number>({ error: "payments.amount.min" })
    .min(1, "payments.amount.min"),
  paidAt: z.coerce.date<Date>({ error: "payments.paidAt.required" }),
  appointmentId: z.string(),
  description: z.string(),
  method: z.enum(inPersonPaymentMethod, {
    error: "payments.method.required",
  }),
  type: z.enum(paymentType, { error: "payments.type.required" }),
});

export type InStorePaymentUpdateModel = z.infer<
  typeof inStorePaymentUpdateModelSchema
>;

export type PaymentSummary = Payment & {
  customerName?: string;
  serviceName?: string;
};
