import { getLoggerFactory } from "@vivid/logger";
import {
  Appointment,
  AppointmentStatus,
  ConnectedAppData,
  ConnectedAppStatusWithText,
  IAppointmentHook,
  IConnectedApp,
  IConnectedAppProps,
} from "@vivid/types";
import {
  AppointmentStatusToICalMethodMap,
  getArguments,
  getEventCalendarContent,
} from "@vivid/utils";
import { EmailNotificationConfiguration } from "./models";

import { getEmailTemplate } from "./emails/utils";

export class EmailNotificationConnectedApp
  implements IConnectedApp, IAppointmentHook
{
  protected readonly loggerFactory = getLoggerFactory(
    "EmailNotificationConnectedApp",
  );

  public constructor(protected readonly props: IConnectedAppProps) {}

  public async processRequest(
    appData: ConnectedAppData,
    data: EmailNotificationConfiguration,
  ): Promise<ConnectedAppStatusWithText> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id },
      "Processing email notification configuration request",
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
          statusText: "emailNotification.statusText.email_app_not_configured",
        };
      }

      const status: ConnectedAppStatusWithText = {
        status: "connected",
        statusText: "emailNotification.statusText.successfully_set_up",
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
          "emailNotification.statusText.error_processing_configuration",
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
      "Appointment created, sending email notification",
    );

    try {
      await this.sendNotification(
        appData,
        appointment,
        confirmed ? "auto-confirmed" : "pending",
        "newRequest",
      );

      logger.info(
        { appId: appData._id, appointmentId: appointment._id, confirmed },
        "Successfully sent email notification for new appointment",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, appointmentId: appointment._id, error },
        "Error sending email notification for new appointment",
      );

      this.props.update({
        status: "failed",
        statusText:
          "emailNotification.statusText.error_sending_email_notification_for_new_appointment",
      });

      throw error;
    }
  }

  public async onAppointmentStatusChanged(
    appData: ConnectedAppData,
    appointment: Appointment,
    newStatus: AppointmentStatus,
    oldStatus?: AppointmentStatus,
    by?: "customer" | "user",
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentStatusChanged");
    logger.debug(
      { appId: appData._id, appointmentId: appointment._id, newStatus, by },
      "Appointment status changed, sending email notification",
    );

    const status =
      by === "customer" && newStatus === "declined"
        ? "cancelledByCustomer"
        : newStatus;
    try {
      await this.sendNotification(appData, appointment, status, newStatus);

      logger.info(
        { appId: appData._id, appointmentId: appointment._id, newStatus, by },
        "Successfully sent email notification for status change",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newStatus,
          error,
        },
        "Error sending email notification for status change",
      );

      this.props.update({
        status: "failed",
        statusText:
          "emailNotification.statusText.error_sending_email_notification_for_status_change",
      });

      throw error;
    }
  }

  public async onAppointmentRescheduled(
    appData: ConnectedAppData,
    appointment: Appointment,
    newTime: Date,
    newDuration: number,
    oldTime?: Date,
    oldDuration?: number,
    doNotNotifyCustomer?: boolean,
    by?: "customer" | "user",
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentRescheduled");
    logger.debug(
      {
        appId: appData._id,
        appointmentId: appointment._id,
        newTime: newTime.toISOString(),
        newDuration,
      },
      "Appointment rescheduled, sending email notification",
    );

    try {
      const newAppointment: Appointment = {
        ...appointment,
        dateTime: newTime,
        totalDuration: newDuration,
      };

      await this.sendNotification(
        appData,
        newAppointment,
        by === "customer" ? "rescheduledByCustomer" : "rescheduled",
        "rescheduled",
      );

      logger.info(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newTime: newTime.toISOString(),
          newDuration,
        },
        "Successfully sent email notification for rescheduled appointment",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newTime: newTime.toISOString(),
          newDuration,
          error,
        },
        "Error sending email notification for rescheduled appointment",
      );

      this.props.update({
        status: "failed",
        statusText:
          "emailNotification.statusText.error_sending_email_notification_for_rescheduled_appointment",
      });

      throw error;
    }
  }

  private async sendNotification(
    appData: ConnectedAppData,
    appointment: Appointment,
    status:
      | keyof typeof AppointmentStatusToICalMethodMap
      | "auto-confirmed"
      | "cancelledByCustomer"
      | "rescheduledByCustomer",
    initiator: keyof typeof AppointmentStatusToICalMethodMap | "newRequest",
  ) {
    const logger = this.loggerFactory("sendNotification");
    logger.debug(
      { appId: appData._id, appointmentId: appointment._id, status, initiator },
      "Sending email notification",
    );

    try {
      const config = await this.props.services
        .ConfigurationService()
        .getConfigurations("booking", "general", "social");

      logger.debug(
        { appId: appData._id, appointmentId: appointment._id },
        "Retrieved configuration for email notification",
      );

      const args = getArguments({
        appointment,
        config,
        customer: appointment.customer,
        useAppointmentTimezone: true,
        locale: config.general.language,
      });

      logger.debug(
        { appId: appData._id, appointmentId: appointment._id },
        "Generated template arguments",
      );

      const data = appData.data as EmailNotificationConfiguration;

      const {
        template: description,
        subject,
        eventTitle,
      } = await getEmailTemplate(
        status,
        config.general.language,
        config.general.url,
        appointment,
        args,
      );

      logger.debug(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          status,
          descriptionLength: description.length,
        },
        "Generated email description from template",
      );

      let newStatus: keyof typeof AppointmentStatusToICalMethodMap;
      if (status === "rescheduledByCustomer") {
        newStatus = "rescheduled";
      } else if (status === "cancelledByCustomer") {
        newStatus = "declined";
      } else if (status === "auto-confirmed") {
        newStatus = "confirmed";
      } else {
        newStatus = status;
      }

      const eventContent = getEventCalendarContent(
        config.general,
        appointment,
        eventTitle,
        description,
        status === "auto-confirmed"
          ? "REQUEST"
          : AppointmentStatusToICalMethodMap[newStatus],
      );

      logger.debug(
        { appId: appData._id, appointmentId: appointment._id, status },
        "Generated event calendar content",
      );

      const recipientEmail = data?.email || config.general.email;

      logger.debug(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          recipientEmail,
          subject,
        },
        "Prepared email details",
      );

      logger.debug(
        { appId: appData._id, appointmentId: appointment._id, recipientEmail },
        "Sending email notification",
      );

      await this.props.services.NotificationService().sendEmail({
        email: {
          to: recipientEmail,
          subject: subject,
          body: description,
          icalEvent: {
            method:
              status === "auto-confirmed"
                ? "REQUEST"
                : AppointmentStatusToICalMethodMap[newStatus],
            content: eventContent,
          },
        },
        participantType: "user",
        handledBy: `emailNotification.handlers.${initiator}`,
        appointmentId: appointment._id,
      });

      logger.info(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          status,
          recipientEmail,
        },
        "Successfully sent email notification",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, appointmentId: appointment._id, status, error },
        "Error sending email notification",
      );
      throw error;
    }
  }
}
