import * as z from "zod";
import { WithDatabaseId, WithOrganizationId } from "../database";
import { zObjectId } from "../utils";
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
  data?: Record<string, any>;
} & (
  | {
      type: Exclude<PaymentType, "rescheduleFee">;
      request: AppointmentRequest;
    }
  | {
      type: Extract<PaymentType, "rescheduleFee" | "cancellationFee">;
      appointmentId: string;
      request: ModifyAppointmentRequest;
    }
  | {
      type: "purchase";
      request: {
        amount: number;
      };
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
      appointmentId: zObjectId("appointments.request.appointmentId.required"),
      request: modifyAppointmentRequestSchema,
    }),
  ],
);

export type CreateOrUpdatePaymentIntentRequest = z.infer<
  typeof createOrUpdatePaymentIntentRequestSchema
>;

export type PaymentIntent = Prettify<
  WithOrganizationId<
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
  amount: number;
  amountPaid: number;
  amountTotal: number;
  isFixedAmount?: boolean;
  giftCards?: {
    code: string;
    amountApplied: number;
  }[];
};

export const inPersonPaymentMethod = ["cash", "in-person-card"] as const;

export const inPersonPaymentSource = ["manual", "synced"] as const;
export type InPersonPaymentSource = (typeof inPersonPaymentSource)[number];

export type PaymentStatus = "paid" | "refunded";
export type OnlinePaymentMethod = "online";
export type InPersonPaymentMethod = (typeof inPersonPaymentMethod)[number];

export const giftCardPaymentMethod = ["gift-card"] as const;
export type GiftCardPaymentMethod = (typeof giftCardPaymentMethod)[number];

export type PaymentMethod =
  | OnlinePaymentMethod
  | InPersonPaymentMethod
  | GiftCardPaymentMethod;

export const paymentMethods = [
  ...inPersonPaymentMethod,
  "online",
  ...giftCardPaymentMethod,
] as const satisfies readonly PaymentMethod[];

export type PaymentUpdateModel = {
  amount: number;
  status: PaymentStatus;
  paidAt: Date;
  appointmentId?: string;
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
      disableUpdate?: boolean;
      /**
       * Origin of the in-person payment. `manual` is staff-entered (default),
       * `synced` is ingested from a payment provider (e.g. PayPal in-store).
       */
      source?: InPersonPaymentSource;
      /** Provider transaction/capture id, set for synced payments. */
      externalId?: string;
      /** Provider app name, set for synced payments (e.g. "paypal"). */
      appName?: string;
      /** Connected app id, set for synced payments. */
      appId?: string;
    }
  | {
      method: OnlinePaymentMethod;
      intentId: string;
      externalId?: string;
      appName: string;
      appId: string;
      /** Provider-specific metadata (PayPal stores checkout order id here). */
      data?: { orderId?: string };
    }
  | {
      method: GiftCardPaymentMethod;
      giftCardCode: string;
      giftCardId: string;
    }
);

export type Payment = Prettify<
  WithOrganizationId<
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

export const inStorePaymentUpdateModelSchema = z
  .object({
    amount: z.coerce
      .number<number>({ error: "validation.payments.amount.positive" })
      .positive("validation.payments.amount.positive"),
    paidAt: z.coerce.date<Date>({
      error: "validation.payments.paidAt.required",
    }),
    description: z.string().max(1024, "validation.payments.description.max"),
    type: z.enum(paymentType, { error: "validation.payments.type.required" }),
    disableUpdate: z.boolean().optional(),
    customerId: zObjectId("validation.payments.customerId.required"),
    appointmentId: zObjectId().optional(),
  })
  .and(
    z.discriminatedUnion("method", [
      z.object({
        method: z.enum(inPersonPaymentMethod, {
          error: "validation.payments.method.required",
        }),
      }),
      z.object({
        method: z.enum(giftCardPaymentMethod, {
          error: "validation.payments.method.required",
        }),
        giftCardId: zObjectId("validation.payments.giftCardId.required"),
      }),
    ]),
  );

export type InStorePaymentUpdateModel = z.infer<
  typeof inStorePaymentUpdateModelSchema
>;

export type PaymentSummary = Prettify<
  Payment & {
    customerName?: string;
    serviceName?: string;
  }
>;
