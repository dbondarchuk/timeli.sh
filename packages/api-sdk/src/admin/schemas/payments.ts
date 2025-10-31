import { zUniqueArray } from "@vivid/types";
import * as z from "zod";

export const refundPaymentsSchema = z.object({
  refunds: zUniqueArray(
    z.array(
      z.object({
        id: z.string().min(1),
        amount: z.number().min(0.01),
      }),
    ),
    (s) => s.id,
  ),
});

export type RefundPayments = z.infer<typeof refundPaymentsSchema>;

export const refundPaymentSchema = z.object({
  amount: z.number().min(0.01),
});

export type RefundPayment = z.infer<typeof refundPaymentSchema>;
