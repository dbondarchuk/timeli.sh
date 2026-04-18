import { WithDatabaseId } from "../database";

export type Organization = WithDatabaseId<{
  slug: string;
  name?: string;
  domain?: string;
  isInstalled?: boolean;
  feesExempt?: boolean;
  /** Polar subscription id (org-level billing via checkout metadata.referenceId). */
  polarSubscriptionId?: string;
  polarSubscriptionStatus?: string;
  polarSubscriptionProductId?: string;
}>;
