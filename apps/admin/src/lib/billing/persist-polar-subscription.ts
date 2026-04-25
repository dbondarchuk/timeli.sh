import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import { ORGANIZATIONS_COLLECTION_NAME } from "@timelish/services/collections";
import { getDbConnection } from "@timelish/services/database";
import {
  parseOrganizationSubscriptionStatus,
  type Organization,
} from "@timelish/types";

import { emitSubscriptionStatusChangedEvent } from "./emit-subscription-status-event";

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

  const newStatus = parseOrganizationSubscriptionStatus(subscription.status);
  const db = await getDbConnection();
  const col = db.collection<Organization>(ORGANIZATIONS_COLLECTION_NAME);

  const before = await col.findOne({ _id: orgId });
  const oldStatus = before?.polarSubscriptionStatus ?? null;

  await col.updateOne(
    { _id: orgId },
    {
      $set: {
        polarSubscriptionId: subscription.id,
        ...(newStatus ? { polarSubscriptionStatus: newStatus } : {}),
        polarSubscriptionProductId: subscription.productId,
      },
    },
  );

  if (newStatus && oldStatus !== newStatus) {
    await emitSubscriptionStatusChangedEvent(orgId, {
      oldStatus,
      newStatus,
      subscriptionId: subscription.id,
      productName: subscription.product?.name ?? null,
    });
  }
}
