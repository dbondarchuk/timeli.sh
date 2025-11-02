import type { IAssetsService } from "./assets.service";
import type { ICommunicationLogsService } from "./communication-logs.service";
import type { IConfigurationService } from "./configuration.service";
import type { IConnectedAppsService } from "./connected-apps.service";
import type { ICustomersService } from "./customers.service";
import type { IEventsService } from "./events.service";
import type { IJobService } from "./job.service";
import type {
  IDashboardNotificationsService,
  INotificationService,
} from "./notification.service";
import type { IOrganizationService } from "./organization.service";
import type { IPagesService } from "./pages.service";
import type { IPaymentsService } from "./payments.service";
import type { IScheduleService } from "./schedule.service";
import type { IServicesService } from "./services.service";
import type { ITemplatesService } from "./templates.service";

export type IServicesContainer = {
  configurationService: IConfigurationService;
  assetsService: IAssetsService;
  eventsService: IEventsService;
  pagesService: IPagesService;
  customersService: ICustomersService;
  servicesService: IServicesService;
  scheduleService: IScheduleService;
  templatesService: ITemplatesService;
  communicationLogsService: ICommunicationLogsService;
  connectedAppsService: IConnectedAppsService;
  notificationService: INotificationService;
  paymentsService: IPaymentsService;
  jobService: IJobService;
  organizationService: IOrganizationService;
  dashboardNotificationsService: IDashboardNotificationsService;
};
