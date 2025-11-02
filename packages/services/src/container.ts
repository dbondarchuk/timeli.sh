// import { IServicesContainer } from "@vivid/types";
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
// } from "@vivid/types";

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

//   constructor(private companyId: string) {}

//   get configurationService(): IConfigurationService {
//     if (!this._configurationService) {
//       this._configurationService = new CachedConfigurationService(
//         this.companyId,
//       );
//     }
//     return this._configurationService;
//   }

//   get assetsService(): IAssetsService {
//     if (!this._assetsService) {
//       this._assetsService = new AssetsService(
//         this.companyId,
//         this.configurationService,
//       );
//     }
//     return this._assetsService;
//   }

//   get jobService(): IJobService {
//     if (!this._jobService) {
//       this._jobService = new BullMQJobService(
//         this.companyId,
//         getBullMQJobConfig(),
//       );
//     }
//     return this._jobService;
//   }

//   get organizationService(): IOrganizationService {
//     if (!this._organizationService) {
//       this._organizationService = new OrganizationService(this.companyId);
//     }
//     return this._organizationService;
//   }

//   get customersService(): ICustomersService {
//     if (!this._customersService) {
//       this._customersService = new CustomersService(
//         this.companyId,
//         this.jobService,
//       );
//     }
//     return this._customersService;
//   }

//   get connectedAppsService(): IConnectedAppsService {
//     if (!this._connectedAppsService) {
//       this._connectedAppsService = new CachedConnectedAppsService(
//         this.companyId,
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
//         this.companyId,
//         this.configurationService,
//       );
//     }
//     return this._servicesService;
//   }

//   get paymentsService(): IPaymentsService {
//     if (!this._paymentsService) {
//       this._paymentsService = new PaymentsService(
//         this.companyId,
//         this.connectedAppsService,
//         this.jobService,
//       );
//     }
//     return this._paymentsService;
//   }

//   get eventsService(): IEventsService {
//     if (!this._eventsService) {
//       this._eventsService = new EventsService(
//         this.companyId,
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
//       this._pagesService = new PagesService(this.companyId);
//     }
//     return this._pagesService;
//   }

//   get templatesService(): ITemplatesService {
//     if (!this._templatesService) {
//       this._templatesService = new TemplatesService(this.companyId);
//     }
//     return this._templatesService;
//   }

//   get communicationLogsService(): ICommunicationLogsService {
//     if (!this._communicationLogsService) {
//       this._communicationLogsService = new CommunicationLogsService(
//         this.companyId,
//       );
//     }
//     return this._communicationLogsService;
//   }

//   get notificationService(): INotificationService {
//     if (!this._notificationService) {
//       this._notificationService = new BullMQNotificationService(
//         this.companyId,
//         getBullMQNotificationConfig(),
//       );
//     }
//     return this._notificationService;
//   }
// }
