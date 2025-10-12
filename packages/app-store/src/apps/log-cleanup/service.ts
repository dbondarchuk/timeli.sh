import { getLoggerFactory } from "@vivid/logger";
import {
  ConnectedAppData,
  ConnectedAppStatusWithText,
  IConnectedApp,
  IConnectedAppProps,
  IScheduled,
} from "@vivid/types";
import { DateTime } from "luxon";
import { LogCleanupConfiguration } from "./models";
import {
  LogCleanupAdminAllKeys,
  LogCleanupAdminKeys,
  LogCleanupAdminNamespace,
} from "./translations/types";

export default class LogCleanupConnectedApp
  implements IConnectedApp, IScheduled
{
  protected readonly loggerFactory = getLoggerFactory("LogCleanupConnectedApp");

  public constructor(protected readonly props: IConnectedAppProps) {}

  public async processRequest(
    appData: ConnectedAppData,
    data: LogCleanupConfiguration,
  ): Promise<
    ConnectedAppStatusWithText<LogCleanupAdminNamespace, LogCleanupAdminKeys>
  > {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id, amount: data.amount, type: data.type },
      "Processing log cleanup configuration request",
    );

    try {
      const status: ConnectedAppStatusWithText<
        LogCleanupAdminNamespace,
        LogCleanupAdminKeys
      > = {
        status: "connected",
        statusText: "app_log-cleanup_admin.statusText.successfully_set_up",
      };

      this.props.update({
        data,
        ...status,
      });

      logger.info(
        {
          appId: appData._id,
          amount: data.amount,
          type: data.type,
          status: status.status,
        },
        "Successfully configured log cleanup",
      );

      return status;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, error },
        "Error processing log cleanup configuration",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_log-cleanup_admin.statusText.error_processing_configuration" satisfies LogCleanupAdminAllKeys,
      });

      throw error;
    }
  }

  public async onTime(appData: ConnectedAppData, date: Date): Promise<void> {
    const logger = this.loggerFactory("onTime");
    logger.debug(
      { appId: appData._id, date: date.toISOString() },
      "Log cleanup scheduled task triggered",
    );

    try {
      let data = appData.data as LogCleanupConfiguration;
      if (!data) {
        logger.debug(
          { appId: appData._id },
          "No configuration found, using defaults",
        );
        data = {} as LogCleanupConfiguration;
      }

      if (!data.amount) {
        logger.debug(
          { appId: appData._id, defaultAmount: 1 },
          "No amount configured, using default",
        );
        data.amount = 1;
      }

      if (!data.type) {
        logger.debug(
          { appId: appData._id, defaultType: "months" },
          "No type configured, using default",
        );
        data.type = "months";
      }

      logger.debug(
        { appId: appData._id, amount: data.amount, type: data.type },
        "Log cleanup configuration resolved",
      );

      const { timeZone } = await this.props.services
        .ConfigurationService()
        .getConfiguration("general");

      logger.debug(
        { appId: appData._id, timeZone },
        "Retrieved timezone configuration",
      );

      const dateTime = DateTime.fromJSDate(date).setZone(timeZone);

      logger.debug(
        {
          appId: appData._id,
          dateTime: dateTime.toISO(),
          hour: dateTime.hour,
          minute: dateTime.minute,
        },
        "Checking if cleanup should run at this time",
      );

      if (dateTime.hour !== 3 || dateTime.minute !== 0) {
        logger.debug(
          { appId: appData._id, hour: dateTime.hour, minute: dateTime.minute },
          "Not cleanup time (3:00 AM), skipping",
        );
        return;
      }

      logger.debug(
        { appId: appData._id, amount: data.amount, type: data.type },
        "Calculating cleanup threshold date",
      );

      const maxDate = dateTime.minus({
        [data.type]: data.amount,
      });

      logger.info(
        {
          appId: appData._id,
          maxDate: maxDate.toISO(),
          amount: data.amount,
          type: data.type,
        },
        `Cleaning up logs older than ${maxDate.toLocaleString(
          DateTime.DATETIME_FULL_WITH_SECONDS,
        )}`,
      );

      logger.debug(
        { appId: appData._id, maxDate: maxDate.toISO() },
        "Calling communication logs service to clear old logs",
      );

      await this.props.services
        .CommunicationLogsService()
        .clearOldLogs(maxDate.toJSDate());

      logger.info(
        { appId: appData._id, maxDate: maxDate.toISO() },
        "Successfully completed log cleanup",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, date: date.toISOString(), error },
        "Error during log cleanup scheduled task",
      );

      this.props.update({
        status: "failed",
        statusText:
          "app_log-cleanup_admin.statusText.error_during_cleanup" satisfies LogCleanupAdminAllKeys,
      });

      throw error;
    }
  }
}
