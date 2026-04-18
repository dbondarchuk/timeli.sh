import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import { ORGANIZATIONS_COLLECTION_NAME } from "@timelish/services/collections";
import { getDbConnection } from "@timelish/services/database";
import type { Organization } from "@timelish/types";

export function organizationIdFromPolarSubscriptionMetadata(
  metadata: Subscription["metadata"],
): string | null {
  const raw = metadata.org ?? metadata.referenceId;
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  return s || null;
}

export async function persistPolarSubscriptionToOrganization(
  subscription: Subscription,
): Promise<void> {
  const orgId = organizationIdFromPolarSubscriptionMetadata(subscription.metadata);
  if (!orgId) return;

  const db = await getDbConnection();
  await db.collection<Organization>(ORGANIZATIONS_COLLECTION_NAME).updateOne(
    { _id: orgId },
    {
      $set: {
        polarSubscriptionId: subscription.id,
        polarSubscriptionStatus: String(subscription.status),
        polarSubscriptionProductId: subscription.productId,
      },
    },
  );
}
