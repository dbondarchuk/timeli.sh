import { getLoggerFactory } from "@vivid/logger";
import {
  Appointment,
  AppointmentStatus,
  CalendarEvent,
  ConnectedAppData,
  ConnectedAppError,
  ConnectedAppStatusWithText,
  IAppointmentHook,
  ICalendarWriter,
  IConnectedApp,
  IConnectedAppProps,
} from "@vivid/types";
import {
  AppointmentStatusToICalMethodMap,
  getArguments,
  getIcsEventUid,
} from "@vivid/utils";
import { convert } from "html-to-text";
import { CalendarWriterConfiguration } from "./models";

import { AvailableApps } from "../../apps";
import { getEmailTemplate } from "../email-notification/emails/utils";

export class CalendarWriterConnectedApp
  implements IConnectedApp, IAppointmentHook
{
  protected readonly loggerFactory = getLoggerFactory(
    "CalendarWriterConnectedApp",
  );

  public constructor(protected readonly props: IConnectedAppProps) {}

  public async processRequest(
    appData: ConnectedAppData,
    data: CalendarWriterConfiguration,
  ): Promise<ConnectedAppStatusWithText> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id, targetAppId: data.appId },
      "Processing calendar writer configuration request",
    );

    try {
      const { name: appName } = await this.props.services
        .ConnectedAppsService()
        .getApp(data.appId);

      logger.debug(
        { appId: appData._id, targetAppId: data.appId, appName },
        "Retrieved target app information",
      );

      const app = AvailableApps[appName];

      if (!app.scope.includes("calendar-write")) {
        logger.error(
          {
            appId: appData._id,
            targetAppId: data.appId,
            appName,
            scope: app.scope,
          },
          "Target app does not support calendar-write scope",
        );

        throw new ConnectedAppError(
          "calendarWriter.statusText.calendar_app_not_found",
        );
      }

      logger.debug(
        { appId: appData._id, targetAppId: data.appId, appName },
        "Target app supports calendar-write scope",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, targetAppId: data.appId, error },
        "Failed to validate calendar app configuration",
      );

      return {
        status: "failed",
        statusText: "calendarWriter.statusText.calendar_app_not_found",
      };
    }

    const status: ConnectedAppStatusWithText = {
      status: "connected",
      statusText: "calendarWriter.statusText.successfully_set_up",
    };

    this.props.update({
      data,
      ...status,
    });

    logger.info(
      { appId: appData._id, targetAppId: data.appId, status: status.status },
      "Successfully configured calendar writer",
    );

    return status;
  }

  public async onAppointmentCreated(
    appData: ConnectedAppData,
    appointment: Appointment,
    confirmed: boolean,
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentCreated");
    logger.debug(
      { appId: appData._id, appointmentId: appointment._id, confirmed },
      "Appointment created, creating calendar event",
    );

    try {
      await this.makeEvent(
        appData,
        appointment,
        confirmed ? "auto-confirmed" : "pending",
        "New Request",
      );

      logger.info(
        { appId: appData._id, appointmentId: appointment._id, confirmed },
        "Successfully created calendar event for new appointment",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, appointmentId: appointment._id, error },
        "Error creating calendar event for new appointment",
      );

      this.props.update({
        status: "failed",
        statusText:
          "calendarWriter.statusText.error_creating_calendar_event_for_new_appointment",
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
      {
        appId: appData._id,
        appointmentId: appointment._id,
        newStatus,
        oldStatus,
        by,
      },
      "Appointment status changed, updating calendar event",
    );

    try {
      const status =
        by === "customer" && newStatus === "declined"
          ? "cancelledByCustomer"
          : newStatus;
      await this.makeEvent(appData, appointment, status, newStatus);

      logger.info(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newStatus,
          oldStatus,
          by,
        },
        "Successfully updated calendar event for status change",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newStatus,
          error,
        },
        "Error updating calendar event for status change",
      );

      this.props.update({
        status: "failed",
        statusText:
          "calendarWriter.statusText.error_updating_calendar_event_for_status_change",
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
        newTime,
        newDuration,
      },
      "Appointment rescheduled, updating calendar event",
    );

    try {
      await this.makeEvent(
        appData,
        appointment,
        by === "customer" ? "rescheduledByCustomer" : "rescheduled",
        "Rescheduled",
      );

      logger.info(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newTime,
          newDuration,
        },
        "Successfully updated calendar event for rescheduled appointment",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          newTime,
          newDuration,
          error,
        },
        "Error updating calendar event for rescheduled appointment",
      );

      this.props.update({
        status: "failed",
        statusText:
          "calendarWriter.statusText.error_updating_calendar_event_for_rescheduled_appointment",
      });

      throw error;
    }
  }

  private async makeEvent(
    appData: ConnectedAppData,
    appointment: Appointment,
    status:
      | keyof typeof AppointmentStatusToICalMethodMap
      | "auto-confirmed"
      | "cancelledByCustomer"
      | "rescheduledByCustomer",
    initiator: string,
  ) {
    const logger = this.loggerFactory("makeEvent");
    logger.debug(
      { appId: appData._id, appointmentId: appointment._id, status, initiator },
      "Making calendar event",
    );

    try {
      const config = await this.props.services
        .ConfigurationService()
        .getConfigurations("booking", "general", "social");

      logger.debug(
        { appId: appData._id, appointmentId: appointment._id },
        "Retrieved configuration for calendar event",
      );

      const args = getArguments({
        appointment,
        config,
        customer: appointment.customer,
        useAppointmentTimezone: true,
        locale: config.general.language,
      });

      const data = appData.data as CalendarWriterConfiguration;

      const { template: description, subject } = await getEmailTemplate(
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
          targetAppId: data.appId,
        },
        "Getting calendar writer service",
      );

      const { app, service } = await this.props.services
        .ConnectedAppsService()
        .getAppService<ICalendarWriter>(data.appId);

      const uid = getIcsEventUid(appointment._id, config.general.url);
      let newStatus: AppointmentStatus;
      if (status === "rescheduled" || status === "rescheduledByCustomer") {
        newStatus = appointment.status;
      } else if (status === "auto-confirmed") {
        newStatus = "confirmed";
      } else if (status === "cancelledByCustomer") {
        newStatus = "declined";
      } else {
        newStatus = status;
      }

      const event: CalendarEvent = {
        id: appointment._id,
        title: subject,
        description: {
          html: description,
          plainText: convert(description, { wordwrap: 130 })
            .trim()
            .replace(/(\r\n|\r|\n)+/g, "\n"),
          url: `${config.general.url}/admin/dashboard/appointments/${appointment._id}`,
        },
        location: {
          name: config.general.name,
          address: config.general.address,
        },
        startTime: appointment.dateTime,
        duration: appointment.totalDuration,
        timeZone: config.general.timeZone,
        uid,
        status: newStatus,
        attendees: [
          // {
          //   name: config.general.name,
          //   email: config.general.email,
          //   status: "organizer",
          //   type: "required",
          // },
          {
            name: config.general.name,
            email: config.general.email,
            status: newStatus === "confirmed" ? "confirmed" : "tentative",
            type: "required",
          },
          {
            name: appointment.fields.name,
            email: appointment.fields.email,
            status: "confirmed",
            type: "required",
          },
        ],
      };

      logger.debug(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          status,
          eventId: event.id,
          uid,
        },
        "Created calendar event object",
      );

      if (status === "pending" || status === "auto-confirmed") {
        logger.debug(
          { appId: appData._id, appointmentId: appointment._id, status },
          "Creating new calendar event",
        );
        await service.createEvent(app, event);
      } else if (status === "declined") {
        logger.debug(
          { appId: appData._id, appointmentId: appointment._id, status },
          "Deleting calendar event",
        );
        await service.deleteEvent(app, uid, event.id);
      } else {
        logger.debug(
          { appId: appData._id, appointmentId: appointment._id, status },
          "Updating calendar event",
        );
        service.updateEvent(app, uid, event);
      }

      logger.info(
        {
          appId: appData._id,
          appointmentId: appointment._id,
          status,
          eventId: event.id,
          uid,
        },
        "Successfully processed calendar event",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, appointmentId: appointment._id, status, error },
        "Error making calendar event",
      );

      throw error;
    }
  }
}
