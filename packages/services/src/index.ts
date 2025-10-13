import { IServicesContainer } from "@vivid/types";
import { cache } from "react";
import { AssetsService } from "./assets.service";
import { CommunicationLogsService } from "./communication-logs.service";
import { CachedConfigurationService } from "./configuration.service";
import { CachedConnectedAppsService } from "./connected-apps.service";
import { CustomersService } from "./customers.service";
import { EventsService } from "./events.service";
import { NotificationService } from "./notifications.service";
import { PagesService } from "./pages.service";
import { PaymentsService } from "./payments.service";
import { ScheduleService } from "./schedule.service";
import { ServicesService } from "./services.service";
import { TemplatesService } from "./templates.service";

export * from "./assets.service";
export * from "./communication-logs.service";
export * from "./configuration.service";
export * from "./connected-apps.service";
export * from "./customers.service";
export * from "./events.service";
export * from "./pages.service";
export * from "./payments.service";
export * from "./schedule.service";
export * from "./services.service";

export const ServicesContainer: IServicesContainer = {
  ConfigurationService: cache(() => new CachedConfigurationService()),
  AssetsService: cache(
    () =>
      new AssetsService(
        ServicesContainer.ConfigurationService(),
        ServicesContainer.ConnectedAppsService(),
      ),
  ),
  EventsService: cache(
    () =>
      new EventsService(
        ServicesContainer.ConfigurationService(),
        ServicesContainer.ConnectedAppsService(),
        ServicesContainer.AssetsService(),
        ServicesContainer.CustomersService(),
        ServicesContainer.ScheduleService(),
        ServicesContainer.ServicesService(),
        ServicesContainer.PaymentsService(),
      ),
  ),
  PagesService: cache(() => new PagesService()),
  CustomersService: cache(
    () => new CustomersService(ServicesContainer.ConnectedAppsService()),
  ),
  ServicesService: cache(
    () => new ServicesService(ServicesContainer.ConfigurationService()),
  ),
  ScheduleService: cache(
    () =>
      new ScheduleService(
        ServicesContainer.ConnectedAppsService(),
        ServicesContainer.ConfigurationService(),
      ),
  ),
  TemplatesService: cache(() => new TemplatesService()),
  CommunicationLogsService: cache(() => new CommunicationLogsService()),
  ConnectedAppsService: cache(() => new CachedConnectedAppsService()),
  PaymentsService: cache(
    () => new PaymentsService(ServicesContainer.ConnectedAppsService()),
  ),
  NotificationService: cache(
    () =>
      new NotificationService(
        ServicesContainer.ConfigurationService(),
        ServicesContainer.ConnectedAppsService(),
        ServicesContainer.CommunicationLogsService(),
      ),
  ),
};
