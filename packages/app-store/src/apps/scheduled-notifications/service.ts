import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  AppJobRequest,
  Appointment,
  ConnectedAppData,
  ConnectedAppStatusWithText,
  IAppointmentHook,
  IConnectedApp,
  IConnectedAppProps,
  IScheduled,
} from "@timelish/types";
import { ScheduledNotificationsJobProcessor } from "./job-processor";
import {
  RequestAction,
  ScheduledNotification,
  ScheduledNotificationsJobPayload,
  ScheduledNotificationUpdateModel,
} from "./models";
import { ScheduledNotificationsRepository } from "./repository";
import {
  ScheduledNotificationsAdminKeys,
  ScheduledNotificationsAdminNamespace,
} from "./translations/types";

export default class ScheduledNotificationsConnectedApp
  implements IConnectedApp, IScheduled, IAppointmentHook
{
  protected readonly loggerFactory: LoggerFactory;
  protected readonly repository: ScheduledNotificationsRepository;
  protected readonly jobProcessor: ScheduledNotificationsJobProcessor;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.repository = new ScheduledNotificationsRepository(props);
    this.jobProcessor = new ScheduledNotificationsJobProcessor(props);
    this.loggerFactory = getLoggerFactory(
      "ScheduledNotificationsConnectedApp",
      props.companyId,
    );
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: RequestAction,
  ): Promise<any> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id, actionType: data.type },
      "Processing scheduled notifications request",
    );

    try {
      switch (data.type) {
        case "get-scheduled-notification":
          logger.debug(
            { appId: appData._id, scheduledNotificationId: data.id },
            "Getting scheduled notification",
          );
          return await this.repository.getScheduledNotification(
            appData._id,
            data.id,
          );

        case "get-scheduled-notifications":
          logger.debug(
            { appId: appData._id, query: data.query },
            "Getting scheduled notifications",
          );
          return await this.repository.getScheduledNotifications(
            appData._id,
            data.query,
          );

        case "delete-scheduled-notifications":
          logger.debug(
            { appId: appData._id, scheduledNotificationIds: data.ids },
            "Deleting scheduled notifications",
          );

          return await this.deleteScheduledNotifications(appData, data.ids);

        case "create-scheduled-notification":
          logger.debug(
            {
              appId: appData._id,
              scheduledNotificationName: data.scheduledNotification.name,
            },
            "Creating scheduled notification",
          );

          return await this.createScheduledNotification(
            appData,
            data.scheduledNotification,
          );

        case "update-scheduled-notification":
          logger.debug(
            {
              appId: appData._id,
              scheduledNotificationId: data.id,
              scheduledNotificationName: data.update.name,
            },
            "Updating scheduled notification",
          );

          return await this.updateScheduledNotification(
            appData,
            data.id,
            data.update,
          );

        case "check-unique-name":
          logger.debug(
            {
              appId: appData._id,
              name: data.name,
              scheduledNotificationId: data.id,
            },
            "Checking unique name",
          );
          return await this.repository.checkUniqueName(
            appData._id,
            data.name,
            data.id,
          );

        default: {
          logger.debug(
            { appId: appData._id },
            "Processing default request - setting up scheduled notifications app",
          );

          const status: ConnectedAppStatusWithText<
            ScheduledNotificationsAdminNamespace,
            ScheduledNotificationsAdminKeys
          > = {
            status: "connected",
            statusText:
              "app_scheduled-notifications_admin.statusText.successfully_set_up",
          };

          this.props.update({
            data,
            ...status,
          });

          logger.info(
            { appId: appData._id },
            "Successfully set up scheduled notifications app",
          );

          return status;
        }
      }
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          actionType: data.type,
          error: error?.message || error?.toString(),
        },
        "Error processing scheduled notifications request",
      );
      throw error;
    }
  }

  public async unInstall(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    logger.debug(
      { appId: appData._id },
      "Uninstalling scheduled notifications app",
    );

    await this.repository.onUninstall(appData._id);

    logger.info(
      { appId: appData._id },
      "Successfully uninstalled scheduled notifications app",
    );
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

    await this.jobProcessor.processJob(appData, jobData);

    logger.info(
      { appId: appData._id, jobData },
      "Successfully processed scheduled notifications job",
    );

    return;
  }

  public async onAppointmentCreated(
    appData: ConnectedAppData,
    appointment: Appointment,
    confirmed: boolean,
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentCreated");
    logger.debug({ appId: appData._id, appointment }, "On appointment created");
    if (!confirmed) {
      logger.debug(
        { appId: appData._id, appointment },
        "Appointment is not confirmed, skipping on appointment created hook",
      );
      return;
    }

    await this.props.services.jobService.scheduleJob({
      type: "app",
      executeAt: "now",
      appId: appData._id,
      payload: {
        type: "update-appointment",
        appointmentId: appointment._id,
      } satisfies ScheduledNotificationsJobPayload,
    });
  }

  public async onAppointmentStatusChanged(
    appData: ConnectedAppData,
    appointment: Appointment,
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentStatusChanged");
    logger.debug({ appId: appData._id, appointment }, "On appointment updated");

    await this.props.services.jobService.scheduleJob({
      type: "app",
      executeAt: "now",
      appId: appData._id,
      payload: {
        type: "update-appointment",
        appointmentId: appointment._id,
      } satisfies ScheduledNotificationsJobPayload,
    });

    logger.info(
      { appId: appData._id, appointment },
      "Successfully scheduled scheduled notifications update appointment job",
    );
  }

  public async onAppointmentRescheduled(
    appData: ConnectedAppData,
    appointment: Appointment,
  ): Promise<void> {
    const logger = this.loggerFactory("onAppointmentRescheduled");
    logger.debug(
      { appId: appData._id, appointment },
      "On appointment rescheduled",
    );

    await this.props.services.jobService.scheduleJob({
      type: "app",
      executeAt: "now",
      appId: appData._id,
      payload: {
        type: "update-appointment",
        appointmentId: appointment._id,
      } satisfies ScheduledNotificationsJobPayload,
    });

    logger.info(
      { appId: appData._id, appointment },
      "Successfully scheduled scheduled notifications update appointment job",
    );
  }

  private async createScheduledNotification(
    appData: ConnectedAppData,
    updateModel: ScheduledNotificationUpdateModel,
  ): Promise<ScheduledNotification> {
    const logger = this.loggerFactory("createScheduledNotification");
    logger.debug(
      { appId: appData._id, updateModel },
      "Creating scheduled notification",
    );

    const scheduledNotification =
      await this.repository.createScheduledNotification(
        appData._id,
        updateModel,
      );

    logger.debug(
      {
        appId: appData._id,
        scheduledNotificationId: scheduledNotification._id,
      },
      "Successfully created scheduled notification, scheduling update scheduled notification job",
    );

    await this.props.services.jobService.scheduleJob({
      type: "app",
      executeAt: "now",
      appId: appData._id,
      payload: {
        type: "update-scheduled-notification",
        scheduledNotificationId: scheduledNotification._id,
      } satisfies ScheduledNotificationsJobPayload,
    });

    logger.info(
      {
        appId: appData._id,
        scheduledNotificationId: scheduledNotification._id,
      },
      "Successfully scheduled update scheduled notification job",
    );

    return scheduledNotification;
  }

  private async updateScheduledNotification(
    appData: ConnectedAppData,
    scheduledNotificationId: string,
    updateModel: ScheduledNotificationUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updateScheduledNotification");
    logger.debug(
      { appId: appData._id, scheduledNotificationId },
      "Updating scheduled notification",
    );

    await this.repository.updateScheduledNotification(
      appData._id,
      scheduledNotificationId,
      updateModel,
    );

    logger.debug(
      { appId: appData._id, scheduledNotificationId },
      "Successfully updated scheduled notification, scheduling update scheduled notification job",
    );

    await this.props.services.jobService.scheduleJob({
      type: "app",
      executeAt: "now",
      appId: appData._id,
      payload: {
        type: "update-scheduled-notification",
        scheduledNotificationId,
      } satisfies ScheduledNotificationsJobPayload,
    });

    logger.info(
      { appId: appData._id, scheduledNotificationId },
      "Successfully scheduled update scheduled notification job",
    );
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

    await this.repository.deleteScheduledNotifications(
      appData._id,
      scheduledNotificationIds,
    );

    logger.info(
      { appId: appData._id, scheduledNotificationIds },
      "Successfully deleted scheduled notifications, deleting scheduled notification jobs",
    );

    await this.props.services.jobService.scheduleJob({
      type: "app",
      appId: appData._id,
      executeAt: "now",
      payload: {
        type: "delete-scheduled-notifications",
        scheduledNotificationIds,
      } satisfies ScheduledNotificationsJobPayload,
    });

    logger.info(
      { appId: appData._id, scheduledNotificationIds },
      "Successfully deleted scheduled notification jobs",
    );
  }
}
