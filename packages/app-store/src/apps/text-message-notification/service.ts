import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  Appointment,
  AppointmentStatus,
  BookingConfiguration,
  ConnectedAppData,
  ConnectedAppStatusWithText,
  GeneralConfiguration,
  IAppointmentHook,
  IConnectedApp,
  IConnectedAppProps,
  ITextMessageResponder,
  RespondResult,
  SocialConfiguration,
  TextMessageReply,
} from "@timelish/types";
import {
  formatAmountString,
  getAdminUrl,
  getArguments,
  getWebsiteUrl,
  template,
} from "@timelish/utils";
import { TextMessageNotificationMessages } from "./messages";
import { TextMessageNotificationConfiguration } from "./models";
import {
  TextMessageNotificationAdminAllKeys,
  TextMessageNotificationAdminKeys,
  TextMessageNotificationAdminNamespace,
} from "./translations/types";

export class TextMessageNotificationConnectedApp
  implements IConnectedApp, IAppointmentHook, ITextMessageResponder
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "TextMessageNotificationConnectedApp",
      props.companyId,
    );
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: TextMessageNotificationConfiguration,
  ): Promise<
    ConnectedAppStatusWithText<
      TextMessageNotificationAdminNamespace,
      TextMessageNotificationAdminKeys
    >
  > {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id, phone: data?.phone },
      "Processing text message notification configuration request",
    );

    try {
      const defaultApps =
        await this.props.services.configurationService.getConfiguration(
          "defaultApps",
        );

      logger.debug(
        { appId: appData._id },
        "Retrieved default apps configuration",
      );

      try {
        const textMessageAppId = defaultApps.textMessageSender?.appId;
        logger.debug(
          { appId: appData._id, textMessageAppId },
          "Retrieved text message app ID",
        );

        await this.props.services.connectedAppsService.getApp(
          textMessageAppId!,
        );

        logger.debug(
          { appId: appData._id, textMessageAppId },
          "Text message app is properly configured",
        );
      } catch (error: any) {
        logger.error(
          { appId: appData._id, error },
          "Text message sender default app is not configured",
        );

        return {
          status: "failed",
          statusText:
            "app_text-message-notification_admin.statusText.text_message_app_not_configured",
        };
      }

      const status: ConnectedAppStatusWithText<
        TextMessageNotificationAdminNamespace,
        TextMessageNotificationAdminKeys
      > = {
        status: "connected",
        statusText:
          "app_text-message-notification_admin.statusText.successfully_set_up",
      };

      this.props.update({
        data,
        ...status,
      });

      logger.info(
        { appId: appData._id, status: status.status },
        "Successfully configured text message notification",
      );

      return status;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error processing text message notification configuration",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_text-message-notification_admin.statusText.error_processing_configuration" satisfies TextMessageNotificationAdminAllKeys,
      });

      throw error;
    }
  }

  public async onAppointmentCreated(
    appData: ConnectedAppData,
    appointment: Appointment,
    confirmed: boolean,
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentCreated");
    logger.debug(
      { appId: appData._id, appointmentId: appointment._id, confirmed },
      "Appointment created, sending owner text message notification",
    );

    try {
      const data = appData.data as TextMessageNotificationConfiguration;
      const config =
        await this.props.services.configurationService.getConfigurations(
          "booking",
          "general",
          "social",
        );

      const totalAmountPaid = appointment.payments
        ?.filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.amount, 0);

      const totalAmountPaidFormatted = totalAmountPaid
        ? formatAmountString(totalAmountPaid)
        : undefined;

      const organization =
        await this.props.services.organizationService.getOrganization();
      if (!organization) {
        logger.error(
          { appId: appData._id, appointmentId: appointment._id },
          "Organization not found",
        );
        return;
      }

      const adminUrl = getAdminUrl();
      const websiteUrl = getWebsiteUrl(
        organization.slug,
        config.general.domain,
      );

      const args = getArguments({
        appointment,
        config,
        customer: appointment.customer,
        locale: config.general.language,
        additionalProperties: {
          confirmed,
          totalAmountPaidFormatted,
        },
        adminUrl,
        websiteUrl,
      });

      const body = template(
        TextMessageNotificationMessages[config.general.language]
          .newAppointmentRequested ??
          TextMessageNotificationMessages["en"].newAppointmentRequested,
        args,
      );

      const phone = data?.phone || config.general.phone;
      if (!phone) {
        logger.warn(
          { appId: appData._id, appointmentId: appointment._id },
          "Phone field not found for owner notification",
        );

        return;
      }

      logger.debug(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          phone: phone.replace(/(\d{3})\d{3}(\d{4})/, "$1***$2"),
          messageLength: body.length,
        },
        "Sending appointment created notification",
      );

      this.props.services.notificationService.sendTextMessage({
        phone,
        body,
        webhookData: {
          appointmentId: appointment._id,
          appId: appData._id,
        },
        appointmentId: appointment._id,
        participantType: "user",
        handledBy:
          "app_text-message-notification_admin.handlers.newRequest" satisfies TextMessageNotificationAdminAllKeys,
      });

      logger.info(
        { appId: appData._id, appointmentId: appointment._id, confirmed },
        "Successfully sent owner text message notification for new appointment",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, appointmentId: appointment._id, error },
        "Error sending owner text message notification for new appointment",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_text-message-notification_admin.statusText.error_sending_owner_text_message_notification_for_new_appointment" satisfies TextMessageNotificationAdminAllKeys,
      });

      throw error;
    }
  }

  public async onAppointmentStatusChanged(
    appData: ConnectedAppData,
    appointment: Appointment,
    newStatus: AppointmentStatus,
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentStatusChanged");
    logger.debug(
      { appId: appData._id, appointmentId: appointment._id, newStatus },
      "Appointment status changed (no action required)",
    );
    // do nothing
  }

  public async onAppointmentRescheduled(
    appData: ConnectedAppData,
    appointment: Appointment,
    newTime: Date,
    newDuration: number,
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentRescheduled");
    logger.debug(
      {
        appId: appData._id,
        appointmentId: appointment._id,
        newTime: newTime.toISOString(),
        newDuration,
      },
      "Appointment rescheduled (no action required)",
    );
    // do nothing
  }

  public async respond(
    appData: ConnectedAppData,
    reply: TextMessageReply,
  ): Promise<RespondResult> {
    const logger = this.loggerFactory("respond");
    logger.debug(
      {
        appId: appData._id,
        appointmentId: reply?.data?.appointmentId,
        from: reply.from?.replace(/(\d{3})\d{3}(\d{4})/, "$1***$2"),
        message: reply.message,
      },
      "Processing text message reply",
    );

    try {
      if (!reply?.data?.appointmentId) {
        logger.error(
          { appId: appData._id, replyData: reply?.data },
          "Appointment ID missing in reply",
        );
        throw new Error(`Appointment Id is missing`);
      }

      const appointment =
        await this.props.services.eventsService.getAppointment(
          reply.data.appointmentId,
        );

      const config =
        await this.props.services.configurationService.getConfigurations(
          "general",
          "booking",
          "social",
        );

      if (!appointment) {
        logger.warn(
          {
            appId: appData._id,
            appointmentId: reply.data.appointmentId,
            from: reply.from?.replace(/(\d{3})\d{3}(\d{4})/, "$1***$2"),
          },
          "Unknown appointment in reply",
        );

        const body = template(
          TextMessageNotificationMessages[config.general.language]
            .unknownAppointment ??
            TextMessageNotificationMessages["en"].unknownAppointment,
          {
            config: config.general,
          },
        );

        await this.props.services.notificationService.sendTextMessage({
          phone: reply.from,
          sender: config.general.name,
          body,
          webhookData: reply.data,
          participantType: "user",
          handledBy:
            "app_text-message-notification_admin.handlers.autoReply" satisfies TextMessageNotificationAdminAllKeys,
        });

        return {
          participantType: "user",
          handledBy:
            "app_text-message-notification_admin.handlers.autoReply" satisfies TextMessageNotificationAdminAllKeys,
        };
      }

      const replyMessage = reply.message.toLocaleLowerCase();

      logger.debug(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          replyMessage,
          currentStatus: appointment.status,
        },
        "Processing reply message",
      );

      if (
        (replyMessage === "y" || replyMessage === "yes") &&
        appointment.status === "pending"
      ) {
        logger.info(
          { appId: appData._id, appointmentId: appointment._id, replyMessage },
          "Processing confirmation reply",
        );

        return await this.processReply(appointment, "confirmed", reply, config);
      } else if (
        (replyMessage === "n" || replyMessage === "no") &&
        appointment.status !== "declined"
      ) {
        logger.info(
          { appId: appData._id, appointmentId: appointment._id, replyMessage },
          "Processing decline reply",
        );

        return await this.processReply(appointment, "declined", reply, config);
      } else {
        logger.warn(
          {
            appId: appData._id,
            appointmentId: appointment._id,
            replyMessage,
            currentStatus: appointment.status,
          },
          "Unknown reply message",
        );

        const organization =
          await this.props.services.organizationService.getOrganization();
        if (!organization) {
          logger.error(
            { appId: appData._id, appointmentId: appointment._id },
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
          appointment,
          config,
          locale: config.general.language,
          adminUrl,
          websiteUrl,
        });

        const body = template(
          TextMessageNotificationMessages[config.general.language]
            .unknownAppointment ??
            TextMessageNotificationMessages["en"].unknownOption,
          args,
        );

        await this.props.services.notificationService.sendTextMessage({
          phone: reply.from,
          sender: config.general.name,
          body,
          webhookData: reply.data,
          participantType: "user",
          handledBy:
            "app_text-message-notification_admin.handlers.autoReply" satisfies TextMessageNotificationAdminAllKeys,
        });

        return {
          participantType: "user",
          handledBy:
            "app_text-message-notification_admin.handlers.autoReply" satisfies TextMessageNotificationAdminAllKeys,
        };
      }
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          appointmentId: reply?.data?.appointmentId,
          error,
        },
        "Error processing text message reply",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_text-message-notification_admin.statusText.error_processing_text_message_reply" satisfies TextMessageNotificationAdminAllKeys,
      });

      throw error;
    }
  }

  private async processReply(
    appointment: Appointment,
    newStatus: Extract<AppointmentStatus, "confirmed" | "declined">,
    reply: TextMessageReply,
    config: {
      general: GeneralConfiguration;
      booking: BookingConfiguration;
      social: SocialConfiguration;
    },
  ): Promise<RespondResult> {
    const logger = this.loggerFactory("processReply");
    logger.info(
      {
        appId: reply.data.appId,
        appointmentId: appointment._id,
        oldStatus: appointment.status,
        newStatus,
      },
      "Processing appointment status change",
    );

    try {
      await this.props.services.eventsService.changeAppointmentStatus(
        appointment._id,
        newStatus,
      );

      const organization =
        await this.props.services.organizationService.getOrganization();
      if (!organization) {
        logger.error(
          { appointmentId: appointment._id },
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
        appointment,
        config,
        locale: config.general.language,
        adminUrl,
        websiteUrl,
      });

      const responseBody = template(
        TextMessageNotificationMessages[config.general.language][
          newStatus === "confirmed"
            ? "appointmentConfirmed"
            : "appointmentDeclined"
        ] ??
          TextMessageNotificationMessages["en"][
            newStatus === "confirmed"
              ? "appointmentConfirmed"
              : "appointmentDeclined"
          ],
        args,
      );

      logger.debug(
        {
          appId: reply.data.appId,
          appointmentId: appointment._id,
          newStatus,
          phone: reply.from?.replace(/(\d{3})\d{3}(\d{4})/, "$1***$2"),
          messageLength: responseBody.length,
        },
        "Sending status change confirmation",
      );

      await this.props.services.notificationService.sendTextMessage({
        phone: reply.from,
        sender: config.general.name,
        body: responseBody,
        webhookData: reply.data,
        participantType: "user",
        handledBy:
          "app_text-message-notification_admin.handlers.autoReply" satisfies TextMessageNotificationAdminAllKeys,
      });

      logger.info(
        { appId: reply.data.appId, appointmentId: appointment._id, newStatus },
        "Successfully processed appointment status change",
      );

      return {
        participantType: "user",
        handledBy:
          "app_text-message-notification_admin.handlers.autoReply" satisfies TextMessageNotificationAdminAllKeys,
      };
    } catch (error: any) {
      logger.error(
        {
          appId: reply.data.appId,
          appointmentId: appointment._id,
          newStatus,
          error,
        },
        "Error processing appointment status change",
      );

      throw error;
    }
  }
}
