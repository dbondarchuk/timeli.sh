import { IServicesContainer } from "@timelish/types";
import { cache } from "react";
import { AssetsService } from "./assets.service";
import {
  BullMQJobService,
  BullMQNotificationService,
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
import { OrganizationService } from "./organization.service";
import { PagesService } from "./pages.service";
import { PaymentsService } from "./payments.service";
import { ScheduleService } from "./schedule.service";
import { ServicesService } from "./services.service";
import { TemplatesService } from "./templates.service";

// BullMQ exports
export * from "./bullmq";

export * from "./assets.service";
export * from "./communication-logs.service";
export * from "./configuration.service";
export * from "./connected-apps.service";
export * from "./customers.service";
export * from "./email";
export * from "./events.service";
export * from "./organization.service";
export * from "./pages.service";
export * from "./payments.service";
export * from "./schedule.service";
export * from "./services.service";

/**
 * ServicesContainer provides company-scoped services
 * Each service must be created with a companyId to ensure proper isolation
 */

export const ServicesContainer: (companyId: string) => IServicesContainer =
  cache((companyId: string) => {
    const configurationService = new CachedConfigurationService(companyId);
    const assetsService = new AssetsService(companyId, configurationService);
    const jobService = new BullMQJobService(companyId, getBullMQJobConfig());
    const dashboardNotificationsService =
      new RedisDashboardNotificationPublisher(companyId, getRedisClient());
    const organizationService = new OrganizationService(companyId);
    const customersService = new CustomersService(companyId, jobService);
    const connectedAppsService = new CachedConnectedAppsService(
      companyId,
      () => services,
    );
    const scheduleService = new ScheduleService(
      connectedAppsService,
      configurationService,
    );
    const servicesService = new ServicesService(
      companyId,
      configurationService,
    );
    const paymentsService = new PaymentsService(
      companyId,
      connectedAppsService,
      jobService,
    );
    const eventsService = new EventsService(
      companyId,
      configurationService,
      connectedAppsService,
      assetsService,
      customersService,
      scheduleService,
      servicesService,
      paymentsService,
      jobService,
      dashboardNotificationsService,
    );

    const pagesService = new PagesService(companyId);

    const templatesService = new TemplatesService(companyId);
    const communicationLogsService = new CommunicationLogsService(companyId);
    const notificationService = new BullMQNotificationService(
      companyId,
      getBullMQNotificationConfig(),
    );

    const services: IServicesContainer = {
      configurationService,
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
      dashboardNotificationsService,
    };

    return services;
  });
