import { renderToStaticMarkup } from "@vivid/email-builder/static";
import { getLoggerFactory } from "@vivid/logger";
import {
  AppJobRequest,
  Appointment,
  ConnectedAppData,
  IConnectedAppProps,
} from "@vivid/types";
import { getArguments, templateSafeWithError } from "@vivid/utils";
import { DateTime } from "luxon";
import pLimit from "p-limit";
import {
  ScheduledNotification,
  ScheduledNotificationsJobPayload,
} from "./models";
import { ScheduledNotificationsRepository } from "./repository";
import {
  calculateScheduledNotificationTime,
  compareAppointmentCount,
} from "./utils";

export const BATCH_SIZE = 100;
export const JOB_CONCURRENCY_LIMIT = 10;

const getJobKey = (scheduledNotificationId: string, appointmentId: string) => {
  return `scheduled-notification-${scheduledNotificationId}-${appointmentId}`;
};

export class ScheduledNotificationsJobProcessor {
  protected readonly loggerFactory = getLoggerFactory(
    "ScheduledNotificationsJobProcessor",
  );
  protected readonly repository: ScheduledNotificationsRepository;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.repository = new ScheduledNotificationsRepository(props);
  }

  public async processJob(
    appData: ConnectedAppData,
    jobData: AppJobRequest<ScheduledNotificationsJobPayload>,
  ): Promise<void> {
    const logger = this.loggerFactory("processJob");
    logger.debug(
      { appId: appData._id, jobData },
      "Processing scheduled notifications job",
    );

    switch (jobData.payload.type) {
      case "send-scheduled-notification":
        return this.sendScheduledNotification(
          appData,
          jobData.payload.appointmentId,
          jobData.payload.scheduledNotificationId,
        );

      case "update-scheduled-notification":
        return this.updateScheduledNotification(
          appData,
          jobData.payload.scheduledNotificationId,
          false,
        );
      case "update-appointment":
        return this.updateAppointment(appData, jobData.payload.appointmentId);
      case "delete-scheduled-notification":
        return this.deleteScheduledNotifications(appData, [
          jobData.payload.scheduledNotificationId,
        ]);
      case "delete-scheduled-notifications":
        return this.deleteScheduledNotifications(
          appData,
          jobData.payload.scheduledNotificationIds,
        );
      default:
        logger.warn({ appId: appData._id, jobData }, "Unsupported job type");
        return;
    }
  }

  private async sendScheduledNotification(
    appData: ConnectedAppData,
    appointmentId: string,
    scheduledNotificationId: string,
  ): Promise<void> {
    const logger = this.loggerFactory("sendScheduledNotification");
    logger.debug(
      {
        appId: appData._id,
        scheduledNotificationId,
        appointmentId,
      },
      "Sending scheduled notification",
    );

    try {
      const appointment = await this.props.services
        .EventsService()
        .getAppointment(appointmentId);
      const scheduledNotification =
        await this.repository.getScheduledNotification(
          appData._id,
          scheduledNotificationId,
        );

      if (!scheduledNotification) {
        logger.warn(
          { appId: appData._id, scheduledNotificationId },
          "Scheduled notification not found",
        );
        return;
      }

      if (!appointment) {
        logger.warn(
          { appId: appData._id, appointmentId },
          "Appointment not found",
        );
        return;
      }

      if (appointment.status !== "confirmed") {
        logger.warn(
          { appId: appData._id, appointmentId },
          "Appointment is not confirmed",
        );
        return;
      }

      const config = await this.props.services
        .ConfigurationService()
        .getConfigurations("booking", "general", "social");
      const args = getArguments({
        appointment,
        config,
        customer: appointment.customer,
        useAppointmentTimezone: true,
        locale: config.general.language,
      });

      const channel = scheduledNotification.channel;
      const template = await this.props.services
        .TemplatesService()
        .getTemplate(scheduledNotification.templateId);

      if (!template) {
        logger.warn(
          {
            appId: appData._id,
            scheduledNotificationId: scheduledNotification._id,
            templateId: scheduledNotification.templateId,
          },
          "Template not found for scheduled notification",
        );
        return;
      }

      if (
        scheduledNotification.appointmentCount &&
        scheduledNotification.appointmentCount.type !== "none"
      ) {
        logger.debug(
          {
            appId: appData._id,
            scheduledNotificationId: scheduledNotification._id,
          },
          "Checking if enough appointments for scheduled notification",
        );

        const appointments = await this.props.services
          .EventsService()
          .getAppointments({
            customerId: appointment.customer._id,
            status: ["confirmed"],
            limit: 0,
          });

        if (
          !compareAppointmentCount(scheduledNotification, appointments.total)
        ) {
          logger.warn(
            {
              appId: appData._id,
              scheduledNotificationId: scheduledNotification._id,
            },
            "Not enough appointments for scheduled notification",
          );
          return;
        }

        logger.debug(
          {
            appId: appData._id,
            scheduledNotificationId: scheduledNotification._id,
          },
          "Enough appointments for scheduled notification",
        );
      }

      logger.debug(
        {
          appId: appData._id,
          scheduledNotificationId: scheduledNotification._id,
          channel,
          templateId: scheduledNotification.templateId,
        },
        "Template found, sending scheduled notification",
      );

      switch (channel) {
        case "email":
          logger.debug(
            {
              appId: appData._id,
              scheduledNotificationId: scheduledNotification._id,
              appointmentId: appointment._id,
              email: appointment.fields.email,
            },
            "Sending email scheduled notification",
          );

          await this.props.services.NotificationService().sendEmail({
            email: {
              body: await renderToStaticMarkup({
                args: args,
                document: template.value,
              }),
              subject: templateSafeWithError(
                scheduledNotification.subject,
                args,
              ),
              to: appointment.fields.email,
            },
            participantType: "customer",
            handledBy: {
              key: `scheduledNotifications.handler`,
              args: {
                scheduledNotificationName: scheduledNotification.name,
              },
            },
            appointmentId: appointment._id,
          });

          logger.info(
            {
              appId: appData._id,
              scheduledNotificationId: scheduledNotification._id,
              appointmentId: appointment._id,
            },
            "Successfully sent email scheduled notification",
          );
          return;

        case "text-message":
          const phone =
            appointment.fields?.phone ?? appointment.customer?.phone;

          if (!phone) {
            logger.warn(
              {
                appId: appData._id,
                scheduledNotificationId: scheduledNotification._id,
                appointmentId: appointment._id,
              },
              "Phone number not found for text message scheduled notification",
            );
            return;
          }

          logger.debug(
            {
              appId: appData._id,
              scheduledNotificationId: scheduledNotification._id,
              appointmentId: appointment._id,
              phone,
            },
            "Sending text message scheduled notification",
          );

          await this.props.services.NotificationService().sendTextMessage({
            phone,
            sender: config.general.name,
            body: templateSafeWithError(template.value, args),
            webhookData: {
              appointmentId: appointment._id,
              appId: appData._id,
            },
            participantType: "customer",
            handledBy: {
              key: `scheduledNotifications.handler`,
              args: {
                scheduledNotificationName: scheduledNotification.name,
              },
            },
            appointmentId: appointment._id,
          });

          logger.info(
            {
              appId: appData._id,
              scheduledNotificationId: scheduledNotification._id,
              appointmentId: appointment._id,
            },
            "Successfully sent text message scheduled notification",
          );
          return;

        default:
          logger.error(
            {
              appId: appData._id,
              scheduledNotificationId: (scheduledNotification as any)._id,
              channel,
            },
            "Unknown scheduled notification channel type",
          );
          return;
      }
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          scheduledNotificationId,
          appointmentId,
          error: error?.message || error?.toString(),
        },
        "Error sending scheduled notification",
      );
      throw error;
    }
  }

  private async updateScheduledNotification(
    appData: ConnectedAppData,
    scheduledNotificationId: string,
    onlyDeleteJobs: boolean = false,
  ): Promise<void> {
    const logger = this.loggerFactory("updateScheduledNotification");
    logger.debug(
      { appId: appData._id, scheduledNotificationId },
      "Updating scheduled notification",
    );

    try {
      const scheduledNotification =
        await this.repository.getScheduledNotification(
          appData._id,
          scheduledNotificationId,
        );

      if (!scheduledNotification) {
        logger.warn(
          { appId: appData._id, scheduledNotificationId },
          "Scheduled notification not found, removing jobs",
        );
      }

      const start = new Date();
      let offset = 0;
      do {
        const appointments = await this.getAppointmentsBatch(
          start,
          offset,
          BATCH_SIZE,
        );

        if (appointments.length === 0) {
          break;
        }

        const limit = pLimit(JOB_CONCURRENCY_LIMIT);

        logger.debug(
          { scheduledNotificationId, appointmentsCount: appointments.length },
          "Processing appointments batch",
        );
        await Promise.all(
          appointments.map((appointment) =>
            limit(async () => {
              try {
                logger.debug(
                  { scheduledNotificationId, appointmentId: appointment._id },
                  "Deleting existing job",
                );
                await this.deleteExistingJob(
                  scheduledNotificationId,
                  appointment._id,
                );
                logger.debug(
                  { scheduledNotificationId, appointmentId: appointment._id },
                  "Successfully deleted existing job, sending scheduled notification",
                );

                if (onlyDeleteJobs || !scheduledNotification) {
                  logger.debug(
                    {
                      scheduledNotificationId,
                      appointmentId: appointment._id,
                      onlyDeleteJobs,
                      hasScheduledNotification: !!scheduledNotification,
                    },
                    "Only deleting jobs or scheduled notification not found, skipping sending scheduled notification",
                  );
                  return;
                }

                await this.scheduleScheduledNotification(
                  appData._id,
                  appointment,
                  scheduledNotification,
                );
                logger.debug(
                  { scheduledNotificationId, appointmentId: appointment._id },
                  "Successfully scheduled scheduled notification",
                );
              } catch (error: any) {
                logger.error(
                  {
                    scheduledNotificationId,
                    appointmentId: appointment._id,
                    error: error?.message || error?.toString(),
                  },
                  "Error processing appointment",
                );
                return;
              }
            }),
          ),
        );

        offset += BATCH_SIZE;
      } while (true);

      logger.debug(
        { scheduledNotificationId },
        "Successfully updated scheduled notification",
      );
      return;
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          scheduledNotificationId,
          error: error?.message || error?.toString(),
        },
        "Error updating scheduled notification",
      );
      throw error;
    }
  }

  private async deleteScheduledNotifications(
    appData: ConnectedAppData,
    scheduledNotificationIds: string[],
  ): Promise<void> {
    const logger = this.loggerFactory("deleteScheduledNotifications");
    logger.debug(
      { appId: appData._id, scheduledNotificationIds },
      "Deleting scheduled notifications",
    );

    try {
      const start = new Date();
      let offset = 0;
      do {
        const appointments = await this.getAppointmentsBatch(
          start,
          offset,
          BATCH_SIZE,
        );

        if (appointments.length === 0) {
          break;
        }

        const limit = pLimit(JOB_CONCURRENCY_LIMIT);

        logger.debug(
          { scheduledNotificationIds, appointmentsCount: appointments.length },
          "Processing appointments batch",
        );
        await Promise.all(
          appointments.map((appointment) =>
            limit(async () => {
              try {
                logger.debug(
                  { scheduledNotificationIds, appointmentId: appointment._id },
                  "Deleting existing job",
                );

                await Promise.all(
                  scheduledNotificationIds.map(
                    async (scheduledNotificationId) => {
                      try {
                        logger.debug(
                          {
                            scheduledNotificationId,
                            appointmentId: appointment._id,
                          },
                          "Deleting existing job",
                        );

                        await this.deleteExistingJob(
                          scheduledNotificationId,
                          appointment._id,
                        );
                        logger.debug(
                          {
                            scheduledNotificationId,
                            appointmentId: appointment._id,
                          },
                          "Successfully deleted existing job",
                        );
                      } catch (error: any) {
                        logger.error(
                          {
                            scheduledNotificationId,
                            appointmentId: appointment._id,
                            error: error?.message || error?.toString(),
                          },
                          "Error deleting existing job",
                        );
                      }
                    },
                  ),
                );

                logger.debug(
                  { scheduledNotificationIds, appointmentId: appointment._id },
                  "Successfully deleted existing jobs",
                );
              } catch (error: any) {
                logger.error(
                  {
                    scheduledNotificationIds,
                    appointmentId: appointment._id,
                    error: error?.message || error?.toString(),
                  },
                  "Error processing appointment",
                );
                return;
              }
            }),
          ),
        );

        offset += BATCH_SIZE;
      } while (true);

      logger.debug(
        { scheduledNotificationIds },
        "Successfully deleted scheduled notifications",
      );
      return;
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          scheduledNotificationIds,
          error: error?.message || error?.toString(),
        },
        "Error deleting scheduled notifications",
      );
      throw error;
    }
  }

  private async updateAppointment(
    appData: ConnectedAppData,
    appointmentId: string,
  ): Promise<void> {
    const logger = this.loggerFactory("updateScheduledNotification");
    logger.debug({ appId: appData._id, appointmentId }, "Updating appointment");

    try {
      const appointment = await this.props.services
        .EventsService()
        .getAppointment(appointmentId);

      if (!appointment) {
        logger.warn(
          { appId: appData._id, appointmentId },
          "Appointment not found",
        );
      }

      let offset = 0;
      do {
        const scheduledNotifications =
          await this.getScheduledNotificationsBatch(
            appData._id,
            offset,
            BATCH_SIZE,
          );
        if (scheduledNotifications.length === 0) {
          break;
        }

        const limit = pLimit(JOB_CONCURRENCY_LIMIT);

        logger.debug(
          {
            appId: appData._id,
            scheduledNotificationCount: scheduledNotifications.length,
          },
          "Processing scheduled notifications batch",
        );
        await Promise.all(
          scheduledNotifications.map((scheduledNotification) =>
            limit(async () => {
              try {
                logger.debug(
                  {
                    appId: appData._id,
                    scheduledNotificationId: scheduledNotification._id,
                  },
                  "Deleting existing job",
                );
                await this.deleteExistingJob(
                  scheduledNotification._id,
                  appointmentId,
                );
                logger.debug(
                  {
                    appId: appData._id,
                    scheduledNotificationId: scheduledNotification._id,
                  },
                  "Successfully deleted existing job",
                );

                if (appointment?.status !== "confirmed") {
                  logger.debug(
                    {
                      appId: appData._id,
                      scheduledNotificationId: scheduledNotification._id,
                    },
                    "Appointment is not confirmed, skipping sending scheduled notification",
                  );
                  return;
                }

                await this.scheduleScheduledNotification(
                  appData._id,
                  appointment,
                  scheduledNotification,
                );
                logger.debug(
                  {
                    appId: appData._id,
                    scheduledNotificationId: scheduledNotification._id,
                  },
                  "Successfully scheduled scheduled notification",
                );
              } catch (error: any) {
                logger.error(
                  {
                    appId: appData._id,
                    scheduledNotificationId: scheduledNotification._id,
                    error: error?.message || error?.toString(),
                  },
                  "Error processing appointment",
                );
              }
            }),
          ),
        );

        offset += BATCH_SIZE;
      } while (true);

      logger.debug(
        { appId: appData._id, appointmentId },
        "Successfully updated appointment",
      );
      return;
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          appointmentId,
          error: error?.message || error?.toString(),
        },
        "Error updating appointment",
      );
      throw error;
    }
  }

  private async getAppointmentsBatch(
    date: Date,
    offset: number,
    limit: number,
  ): Promise<Appointment[]> {
    const logger = this.loggerFactory("getAppointmentsBatch");
    logger.debug({ offset, limit, date }, "Getting appointments batch");

    const appointments = await this.props.services
      .EventsService()
      .getAppointments({
        status: ["confirmed"],
        range: {
          start: date,
        },
        offset,
        limit,
      });

    return appointments.items;
  }

  private async getScheduledNotificationsBatch(
    appId: string,
    offset: number,
    limit: number,
  ): Promise<ScheduledNotification[]> {
    const logger = this.loggerFactory("getScheduledNotificationsBatch");
    logger.debug(
      { appId, offset, limit },
      "Getting scheduled notifications batch",
    );
    const result = await this.repository.getScheduledNotifications(appId, {
      offset,
      limit,
    });

    logger.debug(
      { appId, offset, limit, scheduledNotificationCount: result.items.length },
      "Successfully retrieved scheduled notifications batch",
    );
    return result.items;
  }

  private async deleteExistingJob(
    scheduledNotificationId: string,
    appointmentId: string,
  ): Promise<void> {
    const logger = this.loggerFactory("deleteExistingJob");
    logger.debug(
      { scheduledNotificationId, appointmentId },
      "Deleting existing job",
    );

    const jobKey = getJobKey(scheduledNotificationId, appointmentId);
    await this.props.services.JobService().cancelJob(jobKey);

    logger.debug(
      { scheduledNotificationId, appointmentId },
      "Successfully deleted existing job",
    );
  }

  private async scheduleScheduledNotification(
    appId: string,
    appointment: Appointment,
    scheduledNotification: ScheduledNotification,
  ): Promise<void> {
    const logger = this.loggerFactory("scheduleScheduledNotification");
    const jobKey = getJobKey(scheduledNotification._id, appointment._id);
    const executeAt = calculateScheduledNotificationTime(
      scheduledNotification,
      appointment,
    );

    if (executeAt < DateTime.now()) {
      logger.debug(
        {
          appId,
          scheduledNotificationId: scheduledNotification._id,
          appointmentId: appointment._id,
          jobKey,
          executeAt,
        },
        "Scheduled notification is in the past, skipping",
      );

      return;
    }

    logger.debug(
      {
        appId,
        scheduledNotificationId: scheduledNotification._id,
        appointmentId: appointment._id,
        jobKey,
        executeAt,
      },
      "Scheduling scheduled notification",
    );

    await this.props.services.JobService().scheduleJob({
      type: "app",
      id: jobKey,
      executeAt: executeAt.toJSDate(),
      appId,
      payload: {
        type: "send-scheduled-notification",
        appointmentId: appointment._id,
        scheduledNotificationId: scheduledNotification._id,
      } satisfies ScheduledNotificationsJobPayload,
    });

    logger.debug(
      {
        appId,
        scheduledNotificationId: scheduledNotification._id,
        appointmentId: appointment._id,
        jobKey,
        executeAt,
      },
      "Successfully scheduled scheduled notification",
    );
  }
}
