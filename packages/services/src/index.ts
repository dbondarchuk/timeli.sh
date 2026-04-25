import { IServicesContainer } from "@timelish/types";
import { cache } from "react";
import { ActivityService } from "./activity.service";
import { AssetsService } from "./assets.service";
import { PolarBillingService } from "./billing/polar-billing.service";
import { getPolarClient } from "./billing/utils";
import { BookingService } from "./booking.service";
import {
  BullMQJobService,
  BullMQNotificationService,
  BullMQSystemNotificationService,
  getBullMQJobConfig,
  getBullMQNotificationConfig,
  RedisDashboardNotificationPublisher,
} from "./bullmq";
import { getRedisClient } from "./bullmq/redis-client";
import { CommunicationLogsService } from "./communication-logs.service";
import { CachedConfigurationService } from "./configuration.service";
import { CachedConnectedAppsService } from "./connected-apps.service";
import { CustomersService } from "./customers.service";
import { BullMQEventService, getBullMQEventConfig } from "./events";
import { GiftCardsService } from "./gift-cards.service";
import { OrganizationService } from "./organization.service";
import { PagesService } from "./pages.service";
import { PaymentsService } from "./payments.service";
import { S3AssetsStorageService } from "./s3-assets-storage";
import { getS3Configuration } from "./s3-assets-storage/utils";
import { ScheduleService } from "./schedule.service";
import { ServicesService } from "./services.service";
import { TemplatesService } from "./templates.service";
import { UserService } from "./user.service";

// BullMQ exports
export * from "./bullmq";
export * from "./events";

// Text message exports
export * from "./text-message";

export * from "./activity.service";
export * from "./assets.service";
export * from "./billing";
export * from "./booking.service";
export * from "./communication-logs.service";
export * from "./configuration.service";
export * from "./connected-apps.service";
export * from "./customers.service";
export * from "./email";
export * from "./gift-cards.service";
export * from "./organization.service";
export * from "./pages.service";
export * from "./payments.service";
export * from "./s3-assets-storage";
export * from "./schedule.service";
export * from "./services.service";
export * from "./user.service";

/**
 * ServicesContainer provides organization-scoped services
 * Each service must be created with a organizationId to ensure proper isolation
 */

export const ServicesContainer: (organizationId: string) => IServicesContainer =
  cache((organizationId: string) => {
    const redisClient = getRedisClient();
    const jobService = new BullMQJobService(
      organizationId,
      getBullMQJobConfig(),
    );

    const eventService = new BullMQEventService(
      organizationId,
      getBullMQEventConfig(),
    );

    const configurationService = new CachedConfigurationService(
      organizationId,
      eventService,
    );
    const assetsStorage = new S3AssetsStorageService(
      organizationId,
      getS3Configuration(),
    );
    const assetsService = new AssetsService(
      organizationId,
      configurationService,
      assetsStorage,
      eventService,
    );

    const dashboardNotificationsService =
      new RedisDashboardNotificationPublisher(organizationId, redisClient);
    const organizationService = new OrganizationService(organizationId);
    const userService = new UserService(organizationId);
    const customersService = new CustomersService(organizationId, eventService);
    const activityService = new ActivityService(
      organizationId,
      dashboardNotificationsService,
      redisClient,
    );
    const connectedAppsService = new CachedConnectedAppsService(
      organizationId,
      (orgId) => {
        if (!orgId || orgId === organizationId) {
          return services;
        }

        return ServicesContainer(orgId);
      },
    );
    const scheduleService = new ScheduleService(
      connectedAppsService,
      configurationService,
    );
    const servicesService = new ServicesService(
      organizationId,
      configurationService,
      eventService,
    );
    const paymentsService = new PaymentsService(
      organizationId,
      connectedAppsService,
      eventService,
    );
    const bookingService = new BookingService(
      organizationId,
      configurationService,
      connectedAppsService,
      assetsService,
      customersService,
      scheduleService,
      servicesService,
      paymentsService,
      eventService,
      userService,
    );

    const pagesService = new PagesService(organizationId, eventService);

    const templatesService = new TemplatesService(organizationId, eventService);
    const communicationLogsService = new CommunicationLogsService(
      organizationId,
      assetsStorage,
    );
    const notificationService = new BullMQNotificationService(
      organizationId,
      getBullMQNotificationConfig(),
    );

    const giftCardsService = new GiftCardsService(
      organizationId,
      paymentsService,
      eventService,
    );

    const billingService = new PolarBillingService(
      organizationId,
      organizationService,
      eventService,
      getPolarClient(),
    );

    const services: IServicesContainer = {
      activityService,
      configurationService,
      assetsStorage,
      assetsService,
      bookingService,
      pagesService,
      customersService,
      servicesService,
      scheduleService,
      templatesService,
      communicationLogsService,
      connectedAppsService,
      paymentsService,
      jobService,
      eventService,
      notificationService,
      organizationService,
      userService,
      dashboardNotificationsService,
      giftCardsService,
      billingService,
      redisClient,
    };

    return services;
  });

export const SystemServicesContainer = cache(() => {
  const notificationService = new BullMQSystemNotificationService(
    getBullMQNotificationConfig(),
  );

  return {
    notificationService,
  };
});
