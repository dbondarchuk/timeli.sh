import { renderToStaticMarkup } from "@vivid/email-builder/static";
import { AllKeys } from "@vivid/i18n";
import { getLoggerFactory, LoggerFactory } from "@vivid/logger";
import {
  BookingConfiguration,
  ConnectedAppData,
  ConnectedAppStatusWithText,
  GeneralConfiguration,
  IConnectedApp,
  IConnectedAppProps,
  SocialConfiguration,
} from "@vivid/types";
import {
  durationToTime,
  getAdminUrl,
  getArguments,
  getWebsiteUrl,
  templateSafeWithError,
} from "@vivid/utils";
import { DateTime } from "luxon";
import { WaitlistEntry, waitlistTime } from "../waitlist/models/waitlist";
import { IWaitlistHook } from "../waitlist/models/waitlist-hook";
import { getEmailTemplate } from "./emails/utils";
import {
  WaitlistNotificationsConfiguration,
  waitlistNotificationsConfigurationSchema,
} from "./models";
import {
  WaitlistNotificationsAdminKeys,
  WaitlistNotificationsAdminNamespace,
} from "./translations/types";

export class WaitlistNotificationsConnectedApp
  implements IConnectedApp, IWaitlistHook
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "WaitlistNotificationsConnectedApp",
      props.companyId,
    );
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: WaitlistNotificationsConfiguration,
  ): Promise<ConnectedAppStatusWithText> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id, configuration: data },
      "Processing waitlist notifications configuration request",
    );

    try {
      // Validate configuration
      const validatedConfig =
        waitlistNotificationsConfigurationSchema.parse(data);

      logger.debug(
        { appId: appData._id },
        "Configuration validated successfully",
      );

      // Update the app data with the new configuration
      await this.props.update({
        data: validatedConfig,
        status: "connected",
        statusText:
          "app_waitlist-notifications_admin.statusText.successfully_set_up",
      });

      logger.info(
        { appId: appData._id },
        "Successfully updated waitlist notifications configuration",
      );

      return {
        status: "connected",
        statusText:
          "app_waitlist-notifications_admin.statusText.successfully_set_up",
      };
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error processing waitlist notifications configuration",
      );

      await this.props.update({
        status: "failed",
        statusText:
          "app_waitlist-notifications_admin.statusText.error_processing_configuration",
      });

      throw error;
    }
  }

  public async unInstall(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    logger.debug(
      { appId: appData._id },
      "Uninstalling waitlist notifications app",
    );

    logger.info(
      { appId: appData._id },
      "Successfully uninstalled waitlist notifications app",
    );
  }

  public async onWaitlistEntryCreated(
    appData: ConnectedAppData,
    entry: WaitlistEntry,
  ): Promise<void> {
    const logger = this.loggerFactory("onWaitlistEntryCreated");

    logger.debug(
      {
        appId: appData._id,
        entryId: entry._id,
      },
      "Waitlist entry created, checking notification settings",
    );

    const data = appData.data as WaitlistNotificationsConfiguration;

    if (!data?.notifyOnNewEntry && !data?.notifyCustomerOnNewEntry) {
      logger.debug(
        {
          appId: appData._id,
          entryId: entry._id,
          newEntryNotify: data?.notifyOnNewEntry,
          customerEntryNotify: data?.notifyCustomerOnNewEntry,
        },
        "Waitlist entry created, but notifications are not enabled",
      );
      return;
    }

    logger.debug(
      {
        appId: appData._id,
        entryId: entry._id,
        newEntryNotify: data.notifyOnNewEntry,
        customerEntryNotify: data.notifyCustomerOnNewEntry,
      },
      "Waitlist entry created, sending email notifications",
    );

    try {
      const config =
        await this.props.services.configurationService.getConfigurations(
          "booking",
          "general",
          "social",
        );

      if (data.notifyOnNewEntry) {
        await this.sendUserNotification(
          appData,
          entry,
          "newWaitlistEntry",
          config,
        );
      }

      if (data.notifyCustomerOnNewEntry) {
        await this.sendCustomerNotification(
          appData,
          entry,
          "newWaitlistEntry",
          config,
        );
      }

      logger.info(
        { appId: appData._id, entryId: entry._id },
        "Successfully sent waitlist notifications",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, entryId: entry._id, error },
        "Error sending waitlist notifications",
      );
      // Don't throw error to avoid breaking waitlist entry creation
    }
  }

  public async sendUserNotification(
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

      const organization =
        await this.props.services.organizationService.getOrganization();
      if (!organization) {
        logger.error(
          { appId: appData._id, entryId: entry._id },
          "Organization not found",
        );
        throw new Error("Organization not found");
      }

      const adminUrl = getAdminUrl();
      const websiteUrl = getWebsiteUrl(
        organization.slug,
        config.general.domain,
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
        adminUrl,
        websiteUrl,
      });

      logger.debug(
        { appId: appData._id, entryId: entry._id },
        "Generated template arguments",
      );

      const data = appData.data as WaitlistNotificationsConfiguration;

      const url = getAdminUrl();
      const { template: description, subject } = await getEmailTemplate(
        initiator,
        config.general.language,
        url,
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

      await this.props.services.notificationService.sendEmail({
        email: {
          to: recipientEmail,
          subject: subject,
          body: description,
        },
        participantType: "user",
        handledBy:
          `app_waitlist-notifications_admin.handlers.${initiator}` satisfies AllKeys<
            WaitlistNotificationsAdminNamespace,
            WaitlistNotificationsAdminKeys
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

  public async sendCustomerNotification(
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

      const organization =
        await this.props.services.organizationService.getOrganization();
      if (!organization) {
        logger.error(
          { appId: appData._id, entryId: entry._id },
          "Organization not found",
        );
        throw new Error("Organization not found");
      }

      const adminUrl = getAdminUrl();
      const websiteUrl = getWebsiteUrl(
        organization.slug,
        config.general.domain,
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
        adminUrl,
        websiteUrl,
      });

      logger.debug(
        { appId: appData._id, entryId: entry._id },
        "Generated template arguments",
      );

      const data = appData.data as Extract<
        WaitlistNotificationsConfiguration,
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

      const template = await this.props.services.templatesService.getTemplate(
        data.customerNewEntryTemplateId,
      );

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

      await this.props.services.notificationService.sendEmail({
        email: {
          to: recipientEmail,
          subject: subject,
          body: renderedTemplate,
        },
        participantType: "customer",
        handledBy:
          `app_waitlist-notifications_admin.handlers.${initiator}` satisfies AllKeys<
            WaitlistNotificationsAdminNamespace,
            WaitlistNotificationsAdminKeys
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

const getWaitlistEntryArgs = (entry: WaitlistEntry) => {
  return {
    ...entry,
    duration: entry.duration ? durationToTime(entry.duration) : undefined,
    dates:
      entry.dates?.map((date) => ({
        date: DateTime.fromISO(date.date).toJSDate(),
        time: date.time || [],
        isMorning: date.time?.includes("morning"),
        isAfternoon: date.time?.includes("afternoon"),
        isEvening: date.time?.includes("evening"),
        isAllDay: waitlistTime.every((time) =>
          date.time?.some((t) => t === time),
        ),
      })) || [],
  };
};
