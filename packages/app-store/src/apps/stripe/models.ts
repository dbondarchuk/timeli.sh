import { zNonEmptyString } from "@timelish/types";
import * as z from "zod";
import type { StripeAdminAllKeys } from "./translations/types";

export const stripeAccountDataSchema = z.object({
  accountId: zNonEmptyString(
    "app_stripe_admin.validation.accountId.required" satisfies StripeAdminAllKeys,
  ),
  livemode: z.boolean().optional(),
});

export type StripeAccountData = z.infer<typeof stripeAccountDataSchema>;

export const stripeCreatePaymentIntentRequestSchema = z.object({
  paymentIntentId: zNonEmptyString(
    "app_stripe_admin.validation.paymentIntentId.required" satisfies StripeAdminAllKeys,
  ),
});

export const stripeConfirmPaymentRequestSchema = z.object({
  paymentIntentId: zNonEmptyString(
    "app_stripe_admin.validation.paymentIntentId.required" satisfies StripeAdminAllKeys,
  ),
  /** Optional Stripe PaymentIntent id when externalId is not set yet (race). */
  stripePaymentIntentId: z.string().optional(),
});

export type StripeFormProps = {
  publishableKey: string;
  /** Connect: same `acct_…` used when creating the PaymentIntent on the connected account. */
  stripeAccountId: string;
  className?: string;
};
