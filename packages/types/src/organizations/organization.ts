import { WithDatabaseId } from "../database";
import { OrganizationSubscriptionStatus } from "../billing";

/** Remaining SMS credits: subscription-included pool vs one-time top-ups (consumption order: included first). */
export type OrganizationSmsBalance = {
  included: number;
  topup: number;
};

export type Organization = WithDatabaseId<{
  slug: string;
  name?: string;
  domain?: string;
  isInstalled?: boolean;
  feesExempt?: boolean;
  /** Polar subscription id (org-level billing via checkout metadata.referenceId). */
  polarSubscriptionId?: string;
  polarSubscriptionStatus?: OrganizationSubscriptionStatus;
  polarSubscriptionProductId?: string;
  smsBalance?: OrganizationSmsBalance;
}>;
