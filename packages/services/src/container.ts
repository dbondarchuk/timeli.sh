// import { IServicesContainer } from "@timelish/types";
// import { AssetsService } from "./assets.service";
// import {
//   BullMQJobService,
//   BullMQNotificationService,
//   getBullMQJobConfig,
//   getBullMQNotificationConfig,
// } from "./bullmq";
// import { CommunicationLogsService } from "./communication-logs.service";
// import { CachedConfigurationService } from "./configuration.service";
// import { CachedConnectedAppsService } from "./connected-apps.service";
// import { CustomersService } from "./customers.service";
// import { EventsService } from "./events.service";
// import { OrganizationService } from "./organization.service";
// import { PagesService } from "./pages.service";
// import { PaymentsService } from "./payments.service";
// import { ScheduleService } from "./schedule.service";
// import { ServicesService } from "./services.service";
// import { TemplatesService } from "./templates.service";

// import type {
//   IAssetsService,
//   ICommunicationLogsService,
//   IConfigurationService,
//   IConnectedAppsService,
//   ICustomersService,
//   IEventsService,
//   IJobService,
//   INotificationService,
//   IOrganizationService,
//   IPagesService,
//   IPaymentsService,
//   IScheduleService,
//   IServicesService,
//   ITemplatesService,
// } from "@timelish/types";

// export class ServicesContainer implements IServicesContainer {
//   private _configurationService?: CachedConfigurationService;
//   private _assetsService?: AssetsService;
//   private _jobService?: BullMQJobService;
//   private _organizationService?: OrganizationService;
//   private _customersService?: CustomersService;
//   private _connectedAppsService?: CachedConnectedAppsService;
//   private _scheduleService?: ScheduleService;
//   private _servicesService?: ServicesService;
//   private _paymentsService?: PaymentsService;
//   private _eventsService?: EventsService;
//   private _pagesService?: PagesService;
//   private _templatesService?: TemplatesService;
//   private _communicationLogsService?: CommunicationLogsService;
//   private _notificationService?: BullMQNotificationService;

//   constructor(private organizationId: string) {}

//   get configurationService(): IConfigurationService {
//     if (!this._configurationService) {
//       this._configurationService = new CachedConfigurationService(
//         this.organizationId,
//       );
//     }
//     return this._configurationService;
//   }

//   get assetsService(): IAssetsService {
//     if (!this._assetsService) {
//       this._assetsService = new AssetsService(
//         this.organizationId,
//         this.configurationService,
//       );
//     }
//     return this._assetsService;
//   }

//   get jobService(): IJobService {
//     if (!this._jobService) {
//       this._jobService = new BullMQJobService(
//         this.organizationId,
//         getBullMQJobConfig(),
//       );
//     }
//     return this._jobService;
//   }

//   get organizationService(): IOrganizationService {
//     if (!this._organizationService) {
//       this._organizationService = new OrganizationService(this.organizationId);
//     }
//     return this._organizationService;
//   }

//   get customersService(): ICustomersService {
//     if (!this._customersService) {
//       this._customersService = new CustomersService(
//         this.organizationId,
//         this.jobService,
//       );
//     }
//     return this._customersService;
//   }

//   get connectedAppsService(): IConnectedAppsService {
//     if (!this._connectedAppsService) {
//       this._connectedAppsService = new CachedConnectedAppsService(
//         this.organizationId,
//         () => this,
//       );
//     }
//     return this._connectedAppsService;
//   }

//   get scheduleService(): IScheduleService {
//     if (!this._scheduleService) {
//       this._scheduleService = new ScheduleService(
//         this.connectedAppsService,
//         this.configurationService,
//       );
//     }
//     return this._scheduleService;
//   }

//   get servicesService(): IServicesService {
//     if (!this._servicesService) {
//       this._servicesService = new ServicesService(
//         this.organizationId,
//         this.configurationService,
//       );
//     }
//     return this._servicesService;
//   }

//   get paymentsService(): IPaymentsService {
//     if (!this._paymentsService) {
//       this._paymentsService = new PaymentsService(
//         this.organizationId,
//         this.connectedAppsService,
//         this.jobService,
//       );
//     }
//     return this._paymentsService;
//   }

//   get eventsService(): IEventsService {
//     if (!this._eventsService) {
//       this._eventsService = new EventsService(
//         this.organizationId,
//         this.configurationService,
//         this.connectedAppsService,
//         this.assetsService,
//         this.customersService,
//         this.scheduleService,
//         this.servicesService,
//         this.paymentsService,
//         this.jobService,
//       );
//     }
//     return this._eventsService;
//   }

//   get pagesService(): IPagesService {
//     if (!this._pagesService) {
//       this._pagesService = new PagesService(this.organizationId);
//     }
//     return this._pagesService;
//   }

//   get templatesService(): ITemplatesService {
//     if (!this._templatesService) {
//       this._templatesService = new TemplatesService(this.organizationId);
//     }
//     return this._templatesService;
//   }

//   get communicationLogsService(): ICommunicationLogsService {
//     if (!this._communicationLogsService) {
//       this._communicationLogsService = new CommunicationLogsService(
//         this.organizationId,
//       );
//     }
//     return this._communicationLogsService;
//   }

//   get notificationService(): INotificationService {
//     if (!this._notificationService) {
//       this._notificationService = new BullMQNotificationService(
//         this.organizationId,
//         getBullMQNotificationConfig(),
//       );
//     }
//     return this._notificationService;
//   }
// }
