import { renderToStaticMarkup } from "@timelish/email-builder/static";
import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  Appointment,
  AppointmentStatus,
  ConnectedAppData,
  ConnectedAppStatusWithText,
  IAppointmentHook,
  IConnectedApp,
  IConnectedAppProps,
} from "@timelish/types";
import {
  AppointmentStatusToICalMethodMap,
  getAdminUrl,
  getArguments,
  getEventCalendarContent,
  getWebsiteUrl,
  templateSafeWithError,
} from "@timelish/utils";
import { CustomerEmailNotificationConfiguration } from "./models";
import {
  CustomerEmailNotificationAdminAllKeys,
  CustomerEmailNotificationAdminKeys,
  CustomerEmailNotificationAdminNamespace,
} from "./translations/types";

export default class CustomerEmailNotificationConnectedApp
  implements IConnectedApp, IAppointmentHook
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "CustomerEmailNotificationConnectedApp",
      props.companyId,
    );
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: CustomerEmailNotificationConfiguration,
  ): Promise<
    ConnectedAppStatusWithText<
      CustomerEmailNotificationAdminNamespace,
      CustomerEmailNotificationAdminKeys
    >
  > {
    const logger = this.loggerFactory("processRequest");

    logger.debug(
      { appId: appData._id },
      "Processing customer email notification configuration request",
    );

    try {
      const defaultApps =
        await this.props.services.configurationService.getConfiguration(
          "defaultApps",
        );
      const emailAppId = defaultApps.email.appId;

      logger.debug(
        { appId: appData._id, emailAppId },
        "Retrieved default email app configuration",
      );

      try {
        await this.props.services.connectedAppsService.getApp(emailAppId);
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
          statusText:
            "app_customer-email-notification_admin.statusText.email_app_not_configured",
        };
      }

      const status: ConnectedAppStatusWithText<
        CustomerEmailNotificationAdminNamespace,
        CustomerEmailNotificationAdminKeys
      > = {
        status: "connected",
        statusText: `app_customer-email-notification_admin.statusText.successfully_set_up`,
      };

      this.props.update({
        data,
        ...status,
      });

      logger.info(
        { appId: appData._id, status: status.status },
        "Successfully configured customer email notification",
      );

      return status;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error processing customer email notification configuration",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_customer-email-notification_admin.statusText.error_processing_configuration",
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
      "Appointment created, sending customer email notification",
    );

    try {
      await this.sendNotification(
        appData,
        appointment,
        confirmed ? "confirmed" : "pending",
        "newRequest",
        confirmed,
      );

      logger.info(
        { appId: appData._id, appointmentId: appointment._id, confirmed },
        "Successfully sent customer email notification for new appointment",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, appointmentId: appointment._id, error },
        "Error sending customer email notification for new appointment",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_customer-email-notification_admin.statusText.error_sending_customer_email_notification_for_new_appointment" satisfies CustomerEmailNotificationAdminAllKeys,
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
      "Appointment status changed, sending customer email notification",
    );

    try {
      await this.sendNotification(appData, appointment, newStatus, newStatus);

      logger.info(
        { appId: appData._id, appointmentId: appointment._id, newStatus },
        "Successfully sent customer email notification for status change",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newStatus,
          error,
        },
        "Error sending customer email notification for status change",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_customer-email-notification_admin.statusText.error_sending_customer_email_notification_for_status_change" satisfies CustomerEmailNotificationAdminAllKeys,
      });

      throw error;
    }
  }

  public async onAppointmentRescheduled(
    appData: ConnectedAppData,
    appointment: Appointment,
    newTime: Date,
    newDuration: number,
    _?: Date,
    __?: number,
    doNotNotifyCustomer?: boolean,
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentRescheduled");
    if (doNotNotifyCustomer) {
      logger.debug(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newTime: newTime.toISOString(),
          newDuration,
          doNotNotifyCustomer,
        },
        "Appointment rescheduled, not sending customer email notification - do not notify customer",
      );
      return;
    }

    logger.debug(
      {
        appId: appData._id,
        appointmentId: appointment._id,
        newTime: newTime.toISOString(),
        newDuration,
      },
      "Appointment rescheduled, sending customer email notification",
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
        "rescheduled",
        "rescheduled",
      );

      logger.info(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newTime: newTime.toISOString(),
          newDuration,
        },
        "Successfully sent customer email notification for rescheduled appointment",
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
        "Error sending customer email notification for rescheduled appointment",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_customer-email-notification_admin.statusText.error_sending_customer_email_notification_for_rescheduled_appointment" satisfies CustomerEmailNotificationAdminAllKeys,
      });

      throw error;
    }
  }

  private async sendNotification(
    appData: ConnectedAppData,
    appointment: Appointment,
    status: keyof CustomerEmailNotificationConfiguration["templates"],
    initiator:
      | keyof CustomerEmailNotificationConfiguration["templates"]
      | "newRequest",
    forceRequest?: boolean,
  ) {
    const logger = this.loggerFactory("sendNotification");
    logger.debug(
      {
        appId: appData._id,
        appointmentId: appointment._id,
        status,
        initiator,
        forceRequest,
      },
      "Sending customer email notification",
    );

    try {
      const config =
        await this.props.services.configurationService.getConfigurations(
          "booking",
          "general",
          "social",
        );

      logger.debug(
        { appId: appData._id, appointmentId: appointment._id },
        "Retrieved configuration for email notification",
      );

      const organization =
        await this.props.services.organizationService.getOrganization();
      if (!organization) {
        logger.error(
          { appId: appData._id, appointmentId: appointment._id },
          "Organization not found",
        );
        return;
      }

      const args = getArguments({
        appointment,
        config,
        adminUrl: getAdminUrl(),
        websiteUrl: getWebsiteUrl(organization.slug, config.general.domain),
        customer: appointment.customer,
        useAppointmentTimezone: true,
        locale: config.general.language,
      });

      const data = appData.data as CustomerEmailNotificationConfiguration;

      if (!data.event.templateId) {
        logger.warn(
          { appId: appData._id, appointmentId: appointment._id, status },
          "No event template ID configured, skipping email notification",
        );
        return;
      }

      logger.debug(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          eventTemplateId: data.event.templateId,
        },
        "Getting event template",
      );

      const eventTemplate =
        await this.props.services.templatesService.getTemplate(
          data.event.templateId,
        );
      if (!eventTemplate) {
        logger.error(
          {
            appId: appData._id,
            appointmentId: appointment._id,
            eventTemplateId: data.event.templateId,
          },
          "Event template not found",
        );
        return;
      }

      logger.debug(
        { appId: appData._id, appointmentId: appointment._id },
        "Rendering event template",
      );

      const renderedEventTemplate = await renderToStaticMarkup({
        document: eventTemplate.value,
        args: args,
      });

      const eventContent = getEventCalendarContent(
        config.general,
        appointment,
        templateSafeWithError(data.event.summary, args),
        renderedEventTemplate,
        forceRequest ? "REQUEST" : AppointmentStatusToICalMethodMap[status],
      );

      logger.debug(
        { appId: appData._id, appointmentId: appointment._id, status },
        "Generated event calendar content",
      );

      const { subject, templateId } = data.templates[status];
      if (!templateId) {
        logger.warn(
          { appId: appData._id, appointmentId: appointment._id, status },
          "No email template ID configured for status, skipping email notification",
        );
        return;
      }

      logger.debug(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          templateId,
          subject,
        },
        "Getting email template",
      );

      const template =
        await this.props.services.templatesService.getTemplate(templateId);
      if (!template) {
        logger.error(
          { appId: appData._id, appointmentId: appointment._id, templateId },
          "Email template not found",
        );
        return;
      }

      logger.debug(
        { appId: appData._id, appointmentId: appointment._id },
        "Rendering email template",
      );

      const renderedTemplate = await renderToStaticMarkup({
        args: args,
        document: template.value,
      });

      logger.debug(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          customerEmail: appointment.fields.email,
        },
        "Sending email notification",
      );

      await this.props.services.notificationService.sendEmail({
        email: {
          to: appointment.fields.email,
          subject: templateSafeWithError(subject, args),
          body: renderedTemplate,
          icalEvent: {
            method: forceRequest
              ? "REQUEST"
              : AppointmentStatusToICalMethodMap[status],
            content: eventContent,
          },
        },
        handledBy:
          `app_customer-email-notification_admin.handlers.${initiator}` satisfies CustomerEmailNotificationAdminAllKeys,
        participantType: "customer",
        appointmentId: appointment._id,
      });

      logger.info(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          status,
          customerEmail: appointment.fields.email,
        },
        "Successfully sent customer email notification",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, appointmentId: appointment._id, status, error },
        "Error sending customer email notification",
      );
      throw error;
    }
  }
}
