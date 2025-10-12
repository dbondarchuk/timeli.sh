import { getLoggerFactory } from "@vivid/logger";
import {
  ApiRequest,
  ApiResponse,
  Appointment,
  BookingConfiguration,
  ConnectedAppData,
  ConnectedAppStatusWithText,
  GeneralConfiguration,
  IAppointmentHook,
  IConnectedApp,
  IConnectedAppProps,
  SocialConfiguration,
} from "@vivid/types";
import { getArguments, templateSafeWithError } from "@vivid/utils";
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
  WaitlistEntry,
  WaitlistRequest,
  waitlistRequestSchema,
} from "../models";

import { getWaitlistEntryArgs } from "../models/utils";

import { renderToStaticMarkup } from "@vivid/email-builder/static";
import { AllKeys } from "@vivid/i18n";
import { getEmailTemplate } from "../emails/utils";
import {
  WaitlistAdminKeys,
  WaitlistAdminNamespace,
} from "../translations/types";
import {
  WAITLIST_COLLECTION_NAME,
  WaitlistRepositoryService,
} from "./repository-service";

export class WaitlistConnectedApp implements IConnectedApp, IAppointmentHook {
  protected readonly loggerFactory = getLoggerFactory("WaitlistConnectedApp");

  public constructor(protected readonly props: IConnectedAppProps) {}

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
    if (!appData.data?.waitlistId) {
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
        waitlistId: appData.data.waitlistId,
      },
      "Appointment created, creating waitlist entry",
    );

    const repositoryService = this.getRepositoryService(appData._id);
    const result = await repositoryService.getWaitlistEntry(
      appData.data.waitlistId,
    );
    if (!result) {
      logger.debug(
        { appId: appData._id, waitlistId: appData.data.waitlistId },
        "Waitlist entry not found, skipping appointment created hook",
      );
      return;
    }

    logger.debug(
      { appId: appData._id, waitlistId: appData.data.waitlistId },
      "Waitlist entry found, dismissing waitlist entry",
    );

    await repositoryService.dismissWaitlistEntry(result._id);

    logger.debug(
      { appId: appData._id, waitlistId: appData.data.waitlistId },
      "Waitlist entry dismissed",
    );
  }

  protected getRepositoryService(appId: string) {
    return new WaitlistRepositoryService(
      appId,
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

    const repositoryService = this.getRepositoryService(appData._id);
    const result = await repositoryService.createWaitlistEntry(entry);
    logger.debug({ result }, "Waitlist entry created");

    try {
      await this.onWaitlistEntryCreated(appData, result);
    } catch (error: any) {
      logger.error({ error }, "Error executing sending  notifications");
    }

    return result;
  }

  private async onWaitlistEntryCreated(
    appData: ConnectedAppData<WaitlistConfiguration>,
    entry: WaitlistEntry,
  ): Promise<void> {
    const logger = this.loggerFactory("onWaitlistEntryCreated");
    if (
      !appData.data?.notifyOnNewEntry ||
      !appData.data.notifyCustomerOnNewEntry
    ) {
      logger.debug(
        {
          appId: appData._id,
          entryId: entry._id,
          newEntryNotify: appData.data?.notifyOnNewEntry,
          customerEntryNotify: appData.data?.notifyCustomerOnNewEntry,
        },
        "Waitlist entry created, but notify on new entry is not enabled for both users and customers",
      );
      return;
    }

    logger.debug(
      {
        appId: appData._id,
        entryId: entry._id,
        newEntryNotify: appData.data.notifyOnNewEntry,
        customerEntryNotify: appData.data.notifyCustomerOnNewEntry,
      },
      "Waitlist entry created, sending email notifications",
    );

    const config = await this.props.services
      .ConfigurationService()
      .getConfigurations("booking", "general", "social");

    if (appData.data.notifyOnNewEntry) {
      try {
        logger.debug(
          { appId: appData._id, entryId: entry._id },
          "Sending email notification to user",
        );

        await this.sendUserNotification(
          appData,
          entry,
          "newWaitlistEntry",
          config,
        );

        logger.info(
          { appId: appData._id, entryId: entry._id },
          "Successfully sent email notification for new waitlist entry to user",
        );
      } catch (error: any) {
        logger.error(
          { appId: appData._id, entryId: entry._id, error },
          "Error sending email notification for new waitlist entry to user",
        );

        this.props.update({
          status: "failed",
          statusText:
            "waitlist.statusText.error_sending_email_notification_for_new_waitlist_entry",
        });

        throw error;
      }
    }

    if (appData.data.notifyCustomerOnNewEntry) {
      logger.debug(
        { appId: appData._id, entryId: entry._id },
        "Sending email notification to customer",
      );

      try {
        logger.debug(
          { appId: appData._id, entryId: entry._id },
          "Sending email notification to customer",
        );

        await this.sendCustomerNotification(
          appData,
          entry,
          "newWaitlistEntry",
          config,
        );

        logger.info(
          { appId: appData._id, entryId: entry._id },
          "Successfully sent email notification for new waitlist entry to customer",
        );
      } catch (error: any) {
        logger.error(
          { appId: appData._id, entryId: entry._id, error },
          "Error sending email notification for new waitlist entry to customer",
        );

        throw error;
      }
    }
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
      const repositoryService = this.getRepositoryService(appData._id);
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
      const repositoryService = this.getRepositoryService(appData._id);
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
      const repositoryService = this.getRepositoryService(appData._id);
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
      const defaultApps = await this.props.services
        .ConfigurationService()
        .getConfiguration("defaultApps");

      logger.debug(
        { appId: appData._id },
        "Retrieved default apps configuration",
      );

      const emailAppId = defaultApps.email.appId;

      logger.debug(
        { appId: appData._id, emailAppId },
        "Retrieved email app ID",
      );

      try {
        await this.props.services.ConnectedAppsService().getApp(emailAppId);
        logger.debug(
          { appId: appData._id, emailAppId },
          "Email app is properly configured",
        );
      } catch (error: any) {
        logger.error(
          { appId: appData._id, emailAppId, error },
          "Email sender default is not configured",
        );
        return {
          status: "failed",
          statusText: "app_waitlist_admin.statusText.email_app_not_configured",
        };
      }

      const status: ConnectedAppStatusWithText<
        WaitlistAdminNamespace,
        WaitlistAdminKeys
      > = {
        status: "connected",
        statusText: "app_waitlist_admin.statusText.successfully_set_up",
      };

      this.props.update({
        data,
        ...status,
      });

      logger.info(
        { appId: appData._id, status: status.status },
        "Successfully configured email notification",
      );

      return status;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error processing email notification configuration",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_waitlist_admin.statusText.error_processing_configuration",
      });

      throw error;
    }
  }

  private async sendUserNotification(
    appData: ConnectedAppData,
    entry: WaitlistEntry,
    initiator: "newWaitlistEntry",
    config: {
      booking: BookingConfiguration;
      general: GeneralConfiguration;
      social: SocialConfiguration;
    },
  ) {
    const logger = this.loggerFactory("sendUserNotification");
    logger.debug(
      { appId: appData._id, entryId: entry._id, initiator },
      "Sending waitlist email notification to user",
    );

    try {
      logger.debug(
        { appId: appData._id, entryId: entry._id },
        "Retrieved configuration for email notification",
      );

      const args = getArguments({
        appointment: null,
        config,
        customer: entry.customer,
        useAppointmentTimezone: true,
        locale: config.general.language,
        additionalProperties: {
          waitlistEntry: getWaitlistEntryArgs(entry),
        },
      });

      logger.debug(
        { appId: appData._id, entryId: entry._id },
        "Generated template arguments",
      );

      const data = appData.data as WaitlistConfiguration;

      const { template: description, subject } = await getEmailTemplate(
        initiator,
        config.general.language,
        config.general.url,
        entry,
        args,
      );

      logger.debug(
        {
          appId: appData._id,
          entryId: entry._id,
          initiator,
          descriptionLength: description.length,
        },
        "Generated email description from template",
      );

      const recipientEmail = data?.email || config.general.email;

      logger.debug(
        { appId: appData._id, entryId: entry._id, recipientEmail },
        "Sending email notification",
      );

      await this.props.services.NotificationService().sendEmail({
        email: {
          to: recipientEmail,
          subject: subject,
          body: description,
        },
        participantType: "user",
        handledBy: `app_waitlist_admin.handlers.${initiator}` satisfies AllKeys<
          WaitlistAdminNamespace,
          WaitlistAdminKeys
        >,
        customerId: entry.customer._id,
      });

      logger.info(
        {
          appId: appData._id,
          entryId: entry._id,
          initiator,
          recipientEmail,
        },
        "Successfully sent email notification",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, entryId: entry._id, initiator, error },
        "Error sending email notification",
      );
      throw error;
    }
  }

  private async sendCustomerNotification(
    appData: ConnectedAppData,
    entry: WaitlistEntry,
    initiator: "newWaitlistEntry",
    config: {
      booking: BookingConfiguration;
      general: GeneralConfiguration;
      social: SocialConfiguration;
    },
  ) {
    const logger = this.loggerFactory("sendCustomerNotification");
    logger.debug(
      { appId: appData._id, entryId: entry._id, initiator },
      "Sending waitlist email notification to customer",
    );

    try {
      logger.debug(
        { appId: appData._id, entryId: entry._id },
        "Retrieved configuration for email notification",
      );

      const args = getArguments({
        appointment: null,
        config,
        customer: entry.customer,
        useAppointmentTimezone: true,
        locale: config.general.language,
        additionalProperties: {
          waitlistEntry: getWaitlistEntryArgs(entry),
        },
      });

      logger.debug(
        { appId: appData._id, entryId: entry._id },
        "Generated template arguments",
      );

      const data = appData.data as Extract<
        WaitlistConfiguration,
        { notifyCustomerOnNewEntry: true }
      >;

      if (!data.customerNewEntryTemplateId) {
        logger.warn(
          { appId: appData._id, entryId: entry._id },
          "No customer new entry template ID configured, skipping email notification",
        );
        return;
      }

      if (!data.customerNewEntrySubject) {
        logger.warn(
          { appId: appData._id, entryId: entry._id },
          "No customer new entry subject configured, skipping email notification",
        );
        return;
      }

      const subject = templateSafeWithError(data.customerNewEntrySubject, args);

      const template = await this.props.services
        .TemplatesService()
        .getTemplate(data.customerNewEntryTemplateId);

      if (!template) {
        logger.warn(
          { appId: appData._id, entryId: entry._id },
          "No customer new entry template found, skipping email notification",
        );

        return;
      }

      logger.debug(
        { appId: appData._id, entryId: entry._id },
        "Rendering email template",
      );

      const renderedTemplate = await renderToStaticMarkup({
        args: args,
        document: template.value,
      });

      const recipientEmail = entry.email;

      logger.debug(
        { appId: appData._id, entryId: entry._id, recipientEmail },
        "Sending email notification",
      );

      await this.props.services.NotificationService().sendEmail({
        email: {
          to: recipientEmail,
          subject: subject,
          body: renderedTemplate,
        },
        participantType: "customer",
        handledBy: `app_waitlist_admin.handlers.${initiator}` satisfies AllKeys<
          WaitlistAdminNamespace,
          WaitlistAdminKeys
        >,
        customerId: entry.customer._id,
      });

      logger.info(
        {
          appId: appData._id,
          entryId: entry._id,
          initiator,
          recipientEmail,
        },
        "Successfully sent email notification to customer",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, entryId: entry._id, initiator, error },
        "Error sending email notification to customer",
      );
      throw error;
    }
  }
}
