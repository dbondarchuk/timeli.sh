import {
  DashboardNotificationBadge,
  IConnectedAppProps,
} from "@timelish/types";
import { GIFT_CARD_STUDIO_UNREAD_PURCHASES_BADGE_KEY } from "../const";
import { GiftCardStudioRepositoryService } from "./repository-service";

function lastReadRedisKey(
  organizationId: string,
  appId: string,
  userId: string,
): string {
  return `giftCardStudioPurchases:lastReadAt:${organizationId}:${appId}:${userId}`;
}

export async function getGiftCardStudioPurchasesLastReadAt(
  organizationId: string,
  appId: string,
  userId: string,
  services: IConnectedAppProps["services"],
): Promise<Date> {
  const lastRead = await services.redisClient.get(
    lastReadRedisKey(organizationId, appId, userId),
  );
  return lastRead ? new Date(lastRead) : new Date(0);
}

export async function markGiftCardStudioPurchasesRead(
  organizationId: string,
  appId: string,
  userId: string,
  services: IConnectedAppProps["services"],
): Promise<void> {
  await services.redisClient.set(
    lastReadRedisKey(organizationId, appId, userId),
    new Date().toISOString(),
  );
}

export async function getGiftCardStudioUnreadPurchasesBadges(
  appId: string,
  organizationId: string,
  userId: string | undefined,
  getDbConnection: IConnectedAppProps["getDbConnection"],
  services: IConnectedAppProps["services"],
): Promise<DashboardNotificationBadge[]> {
  if (!userId) {
    return [{ key: GIFT_CARD_STUDIO_UNREAD_PURCHASES_BADGE_KEY, count: 0 }];
  }

  const lastReadAt = await getGiftCardStudioPurchasesLastReadAt(
    organizationId,
    appId,
    userId,
    services,
  );
  const repository = new GiftCardStudioRepositoryService(
    appId,
    organizationId,
    getDbConnection,
    services,
  );
  const count = await repository.getCustomerPurchasesCountSince(lastReadAt);

  return [{ key: GIFT_CARD_STUDIO_UNREAD_PURCHASES_BADGE_KEY, count }];
}
