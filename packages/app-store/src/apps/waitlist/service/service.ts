import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  ApiRequest,
  ApiResponse,
  Appointment,
  ConnectedAppData,
  ConnectedAppStatusWithText,
  DashboardNotification,
  IAppointmentHook,
  IConnectedApp,
  IConnectedAppProps,
  IDashboardNotifierApp,
} from "@timelish/types";
import {
  DismissWaitlistEntriesAction,
  DismissWaitlistEntriesActionType,
  GetWaitlistEntriesAction,
  GetWaitlistEntriesActionType,
  GetWaitlistEntryAction,
  GetWaitlistEntryActionType,
  RequestAction,
  SetConfigurationAction,
  SetConfigurationActionType,
  WaitlistConfiguration,
  waitlistConfigurationSchema,
  WaitlistEntry,
  WaitlistRequest,
  waitlistRequestSchema,
} from "../models";

import {
  WaitlistAdminAllKeys,
  WaitlistAdminKeys,
  WaitlistAdminNamespace,
} from "../translations/types";
import {
  WAITLIST_COLLECTION_NAME,
  WaitlistRepositoryService,
} from "./repository-service";

export class WaitlistConnectedApp
  implements IConnectedApp, IAppointmentHook, IDashboardNotifierApp
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "WaitlistConnectedApp",
      props.companyId,
    );
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: RequestAction,
  ): Promise<any> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id },
      "Processing waitlist notification request",
    );

    switch (data.type) {
      case GetWaitlistEntryActionType:
        return this.processGetWaitlistEntryRequest(appData, data);
      case GetWaitlistEntriesActionType:
        return this.processGetWaitlistEntriesRequest(appData, data);
      case DismissWaitlistEntriesActionType:
        return this.processDismissWaitlistEntriesRequest(appData, data);
      case SetConfigurationActionType:
        return this.processSetConfigurationRequest(appData, data.configuration);
    }
  }

  public async install(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("install");
    logger.debug({ appId: appData._id }, "Installing waitlist app");

    const repositoryService = this.getRepositoryService(
      appData._id,
      appData.companyId,
    );

    await repositoryService.installWaitlistApp();

    logger.debug({ appId: appData._id }, "Waitlist app installed successfully");
  }

  public async unInstall(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    logger.debug({ appId: appData._id }, "Uninstalling follow-ups app");

    try {
      const db = await this.props.getDbConnection();
      const collection = db.collection<WaitlistEntry>(WAITLIST_COLLECTION_NAME);
      await collection.deleteMany({
        appId: appData._id,
      });

      const count = await collection.countDocuments({});
      if (count === 0) {
        await db.dropCollection(WAITLIST_COLLECTION_NAME);
      }

      logger.info(
        { appId: appData._id },
        "Successfully uninstalled waitlist app",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error: error?.message || error?.toString() },
        "Error uninstalling waitlist app",
      );
      throw error;
    }
  }

  public async processAppCall(
    appData: ConnectedAppData,
    slug: string[],
    request: ApiRequest,
  ): Promise<ApiResponse> {
    if (
      slug.length === 1 &&
      slug[0] === "waitlist" &&
      request.method.toUpperCase() === "POST"
    ) {
      return this.processCreateWaitlistEntryRequest(appData, request);
    }

    return Response.json(
      { success: false, error: "Unknown request" },
      { status: 404 },
    );
  }

  public async onAppointmentCreated(
    appData: ConnectedAppData,
    appointment: Appointment,
    confirmed: boolean,
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentCreated");
    if (appData.data?.dontDismissWaitlistOnAppointmentCreate) {
      logger.debug(
        { appId: appData._id },
        "Don't dismiss waitlist on appointment create is enabled, skipping appointment created hook",
      );

      return;
    }

    if (!appointment.data?.waitlistId) {
      logger.debug(
        { appId: appData._id },
        "Waitlist ID not found in app data, skipping appointment created hook",
      );

      return;
    }

    logger.debug(
      {
        appId: appData._id,
        appointmentId: appointment._id,
        waitlistId: appointment.data.waitlistId,
      },
      "Appointment created, creating waitlist entry",
    );

    const repositoryService = this.getRepositoryService(
      appData._id,
      appData.companyId,
    );
    const result = await repositoryService.getWaitlistEntry(
      appointment.data.waitlistId,
    );
    if (!result) {
      logger.debug(
        { appId: appData._id, waitlistId: appointment.data.waitlistId },
        "Waitlist entry not found, skipping appointment created hook",
      );
      return;
    }

    logger.debug(
      { appId: appData._id, waitlistId: appointment.data.waitlistId },
      "Waitlist entry found, dismissing waitlist entry",
    );

    await repositoryService.dismissWaitlistEntry(result._id);

    logger.debug(
      { appId: appData._id, waitlistId: appointment.data.waitlistId },
      "Waitlist entry dismissed",
    );
  }

  public async getInitialNotifications(
    appData: ConnectedAppData,
    date?: Date,
  ): Promise<DashboardNotification[]> {
    const logger = this.loggerFactory("getNotifications");
    logger.debug({ date }, "Getting waitlist notifications");

    const repositoryService = this.getRepositoryService(
      appData._id,
      appData.companyId,
    );
    const result = await repositoryService.getWaitlistEntriesCount(date);

    logger.debug({ result }, "Waitlist entries count retrieved");

    return [
      {
        type: "waitlist-entries",
        badges: [
          {
            key: "waitlist_entries",
            count: result.totalCount,
          },
        ],
        toast:
          result.newCount > 0
            ? {
                type: "info",
                title: {
                  key: "app_waitlist_admin.notifications.newEntries" satisfies WaitlistAdminAllKeys,
                },
                message: {
                  key: "app_waitlist_admin.notifications.message" satisfies WaitlistAdminAllKeys,
                  args: {
                    count: result.newCount,
                  },
                },
                action: {
                  label: {
                    key: "app_waitlist_admin.notifications.viewWaitlist" satisfies WaitlistAdminAllKeys,
                  },
                  href: `/dashboard?activeTab=waitlist&key=${Date.now()}`,
                },
              }
            : undefined,
      },
    ];
  }

  protected getRepositoryService(appId: string, companyId: string) {
    return new WaitlistRepositoryService(
      appId,
      companyId,
      this.props.getDbConnection,
      this.props.services,
    );
  }

  private async processCreateWaitlistEntryRequest(
    appData: ConnectedAppData,
    request: ApiRequest,
  ): Promise<ApiResponse> {
    const logger = this.loggerFactory("processCreateWaitlistEntryRequest");
    const requestParsed = await request.json();
    const { data, success, error } =
      waitlistRequestSchema.safeParse(requestParsed);
    if (!success) {
      logger.error({ error }, "Invalid waitlist request");
      return Response.json({ success: false, error }, { status: 400 });
    }

    logger.debug({ data }, "Creating waitlist entry");

    const options =
      await this.props.services.eventsService.getAppointmentOptions();
    const option = options.options.find((o) => o._id === data.optionId);
    if (!option) {
      logger.error({ data }, "Option not found");
      return Response.json(
        { success: false, error: "Option not found", code: "option_not_found" },
        { status: 400 },
      );
    }

    if (
      data.addonsIds?.length &&
      !data.addonsIds.every((id) => option.addons?.some((a) => a._id === id))
    ) {
      logger.error({ data }, "Addons not found");
      return Response.json(
        { success: false, error: "Addons not found", code: "addons_not_found" },
        { status: 400 },
      );
    }

    try {
      const result = await this.createWaitlistEntry(appData, data);
      logger.debug({ result }, "Waitlist entry created");
      return Response.json(result, { status: 201 });
    } catch (error: any) {
      logger.error({ error }, "Error creating waitlist entry");
      return Response.json({ success: false, error }, { status: 500 });
    }
  }

  private async createWaitlistEntry(
    appData: ConnectedAppData<WaitlistConfiguration>,
    entry: WaitlistRequest,
  ): Promise<WaitlistEntry> {
    const logger = this.loggerFactory("createWaitlistEntry");
    logger.debug({ entry }, "Creating waitlist entry");

    const repositoryService = this.getRepositoryService(
      appData._id,
      appData.companyId,
    );
    const result = await repositoryService.createWaitlistEntry(entry);
    logger.debug({ result }, "Waitlist entry created");

    return result;
  }

  private async processDismissWaitlistEntriesRequest(
    appData: ConnectedAppData,
    data: DismissWaitlistEntriesAction,
  ) {
    const logger = this.loggerFactory("processDismissWaitlistEntriesRequest");
    logger.debug(
      { appId: appData._id },
      "Processing dismiss waitlist entries request",
    );

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      const result = await repositoryService.dismissWaitlistEntries(data.ids);
      logger.debug(
        { appId: appData._id },
        "Successfully dismissed waitlist entries",
      );
      return result;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error dismissing waitlist entries",
      );
      throw error;
    }
  }

  private async processGetWaitlistEntryRequest(
    appData: ConnectedAppData,
    data: GetWaitlistEntryAction,
  ) {
    const logger = this.loggerFactory("processGetWaitlistEntryRequest");
    logger.debug(
      { appId: appData._id },
      "Processing get waitlist entry request",
    );

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );
      const result = await repositoryService.getWaitlistEntry(data.id);
      logger.debug(
        { appId: appData._id },
        "Successfully retrieved waitlist entry",
      );
      return result;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error retrieving waitlist entry",
      );
      throw error;
    }
  }

  private async processGetWaitlistEntriesRequest(
    appData: ConnectedAppData,
    data: GetWaitlistEntriesAction,
  ) {
    const logger = this.loggerFactory("processGetWaitlistEntriesRequest");
    logger.debug(
      { appId: appData._id },
      "Processing get waitlist entries request",
    );

    try {
      const repositoryService = this.getRepositoryService(
        appData._id,
        appData.companyId,
      );

      const result = await repositoryService.getWaitlistEntries(data.query);
      logger.debug(
        { appId: appData._id },
        "Successfully retrieved waitlist entries",
      );
      return result;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error retrieving waitlist entries",
      );
      throw error;
    }
  }

  private async processSetConfigurationRequest(
    appData: ConnectedAppData,
    data: SetConfigurationAction["configuration"],
  ): Promise<
    ConnectedAppStatusWithText<WaitlistAdminNamespace, WaitlistAdminKeys>
  > {
    const logger = this.loggerFactory("processSetConfigurationRequest");
    logger.debug(
      { appId: appData._id },
      "Processing set configuration request",
    );

    try {
      // Validate configuration
      const validatedConfig = waitlistConfigurationSchema.parse(data);

      logger.debug(
        { appId: appData._id },
        "Configuration validated successfully",
      );

      const status: ConnectedAppStatusWithText<
        WaitlistAdminNamespace,
        WaitlistAdminKeys
      > = {
        status: "connected",
        statusText:
          "app_waitlist_admin.statusText.successfully_set_up" satisfies WaitlistAdminAllKeys,
      };

      this.props.update({
        data: validatedConfig,
        ...status,
      });

      logger.info(
        { appId: appData._id, status: status.status },
        "Successfully configured waitlist",
      );

      return status;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error processing waitlist configuration",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_waitlist_admin.statusText.error_processing_configuration" satisfies WaitlistAdminAllKeys,
      });

      throw error;
    }
  }
}
