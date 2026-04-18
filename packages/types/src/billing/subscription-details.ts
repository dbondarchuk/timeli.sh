import { OrganizationBillingSmsBenefit } from "./sms";

export type BillingInterval = "month" | "year" | "week" | "day";

/** Subscription price in minor units (e.g. cents), unformatted. */
export type BillingSubscriptionPrice = {
  amountCents: number;
  currency: string;
  /** e.g. `month`, `year`, `week`, `day`; `null` if not recurring. */
  recurringInterval: BillingInterval | null;
};

/**
 * Organization billing snapshot for subscription + SMS credits (provider-agnostic shape).
 * Date fields are ISO strings so this type can cross the server/client boundary unchanged.
 */
export type OrganizationBillingSubscriptionDetails = {
  feesExempt: boolean;
  subscriptionId: string | null;
  subscriptionName: string | null;
  status: string | null;
  subscriptionPrice: BillingSubscriptionPrice | null;
  nextCycleDate: Date | null;
  benefits: {
    sms: OrganizationBillingSmsBenefit | null;
  };
};
