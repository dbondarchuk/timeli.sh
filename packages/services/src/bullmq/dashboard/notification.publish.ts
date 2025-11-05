import type { LoggerFactory } from "@timelish/logger";
import { getLoggerFactory } from "@timelish/logger";
import type {
  DashboardNotification,
  IDashboardNotificationsService,
} from "@timelish/types";
import type { Redis } from "ioredis";

export class RedisDashboardNotificationPublisher
  implements IDashboardNotificationsService
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(
    protected readonly companyId: string,
    protected readonly redisClient: Redis,
  ) {
    this.loggerFactory = getLoggerFactory(
      "RedisDashboardNotificationPublisher",
      companyId,
    );
  }

  public async publishNotification(
    notification: DashboardNotification,
  ): Promise<void> {
    const logger = this.loggerFactory("publishNotification");
    logger.info({ notification }, "Publishing notification");

    const count = await this.redisClient.publish(
      `dashboard:notifications:${this.companyId}`,
      JSON.stringify(notification),
    );

    logger.info({ count }, "Notification published");
  }
}
