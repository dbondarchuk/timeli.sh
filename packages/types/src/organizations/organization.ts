import { WithDatabaseId } from "../database";
import { OrganizationSubscriptionStatus } from "../billing";

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
}>;
