import { IServicesContainer } from "@timelish/types";
import { cache } from "react";
import { AssetsService } from "./assets.service";
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
import { EventsService } from "./events.service";
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

// Text message exports
export * from "./text-message";

export * from "./assets.service";
export * from "./communication-logs.service";
export * from "./configuration.service";
export * from "./connected-apps.service";
export * from "./customers.service";
export * from "./email";
export * from "./events.service";
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
    const configurationService = new CachedConfigurationService(organizationId);
    const assetsStorage = new S3AssetsStorageService(
      organizationId,
      getS3Configuration(),
    );
    const assetsService = new AssetsService(
      organizationId,
      configurationService,
      assetsStorage,
    );

    const redisClient = getRedisClient();
    const jobService = new BullMQJobService(
      organizationId,
      getBullMQJobConfig(),
    );

    const dashboardNotificationsService =
      new RedisDashboardNotificationPublisher(organizationId, redisClient);
    const organizationService = new OrganizationService(organizationId);
    const userService = new UserService(organizationId);
    const customersService = new CustomersService(organizationId, jobService);
    const connectedAppsService = new CachedConnectedAppsService(
      organizationId,
      () => services,
    );
    const scheduleService = new ScheduleService(
      connectedAppsService,
      configurationService,
    );
    const servicesService = new ServicesService(
      organizationId,
      configurationService,
      jobService,
    );
    const paymentsService = new PaymentsService(
      organizationId,
      connectedAppsService,
      jobService,
    );
    const eventsService = new EventsService(
      organizationId,
      configurationService,
      connectedAppsService,
      assetsService,
      customersService,
      scheduleService,
      servicesService,
      paymentsService,
      jobService,
      dashboardNotificationsService,
      userService,
    );

    const pagesService = new PagesService(organizationId);

    const templatesService = new TemplatesService(organizationId);
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
      jobService,
    );

    const services: IServicesContainer = {
      configurationService,
      assetsStorage,
      assetsService,
      eventsService,
      pagesService,
      customersService,
      servicesService,
      scheduleService,
      templatesService,
      communicationLogsService,
      connectedAppsService,
      paymentsService,
      jobService,
      notificationService,
      organizationService,
      userService,
      dashboardNotificationsService,
      giftCardsService,
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
