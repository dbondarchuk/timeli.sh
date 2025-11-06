import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  CalendarBusyTime,
  ConnectedAppData,
  ConnectedAppStatusWithText,
  ICalendarBusyTimeProvider,
  IConnectedApp,
  IConnectedAppProps,
  Schedule,
  ScheduleOverride,
  WeekIdentifier,
  WithDatabaseId,
} from "@timelish/types";
import { eachOfInterval, getWeekIdentifier, parseTime } from "@timelish/utils";
import { ObjectId } from "mongodb";
import { RequestAction } from "./models";
import {
  BusyEventsAdminAllKeys,
  BusyEventsAdminKeys,
  BusyEventsAdminNamespace,
  BusyEventsPublicKeys,
  busyEventsPublicNamespace,
  BusyEventsPublicNamespace,
} from "./translations/types";

export const BUSY_EVENTS_COLLECTION_NAME = "busy-events";

type BusyEventsEntity = WithDatabaseId<ScheduleOverride> & {
  appId: string;
};

export default class BusyEventsConnectedApp
  implements IConnectedApp, ICalendarBusyTimeProvider
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "BusyEventsConnectedApp",
      props.companyId,
    );
  }

  public async unInstall(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    logger.debug({ appId: appData._id }, "Starting uninstall");

    try {
      const db = await this.props.getDbConnection();
      const collection = db.collection<BusyEventsEntity>(
        BUSY_EVENTS_COLLECTION_NAME,
      );

      logger.debug({ appId: appData._id }, "Deleting busy events");
      const deleteResult = await collection.deleteMany({
        appId: appData._id,
        companyId: appData.companyId,
      });

      logger.info(
        { appId: appData._id, deletedCount: deleteResult.deletedCount },
        "Deleted busy events",
      );

      const count = await collection.countDocuments({});
      logger.debug(
        { appId: appData._id, remainingCount: count },
        "Remaining documents in collection",
      );

      if (count === 0) {
        logger.debug({ appId: appData._id }, "Dropping empty collection");
        await db.dropCollection(BUSY_EVENTS_COLLECTION_NAME);
      }

      logger.info({ appId: appData._id }, "Successfully uninstalled");
    } catch (error) {
      logger.error({ appId: appData._id, error }, "Error during uninstall");
      throw error;
    }
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: RequestAction,
  ): Promise<any> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id, requestType: data.type },
      "Processing request",
    );

    try {
      switch (data.type) {
        case "get-weekly-busy-events":
          logger.debug(
            { appId: appData._id, week: data.week },
            "Getting weekly busy events",
          );

          const result = await this.getWeekBusyEvents(appData._id, data.week);

          logger.debug(
            { appId: appData._id, week: data.week, eventCount: result.length },
            "Retrieved weekly busy events",
          );
          return result;

        case "set-busy-events":
          logger.debug(
            {
              appId: appData._id,
              week: data.week,
              eventCount: data.events.length,
            },
            "Setting busy events",
          );

          await this.setBusyEvents(appData._id, data.week, data.events);
          logger.info(
            { appId: appData._id, week: data.week },
            "Successfully set busy events",
          );

          return;

        default: {
          logger.debug({ appId: appData._id }, "Processing default request");

          const status: ConnectedAppStatusWithText<
            BusyEventsAdminNamespace,
            BusyEventsAdminKeys
          > = {
            status: "connected",
            statusText:
              "app_busy-events_admin.statusText.successfully_set_up" satisfies BusyEventsAdminAllKeys,
          };

          this.props.update({
            ...status,
          });

          logger.info(
            { appId: appData._id, status: status.status },
            "App status updated",
          );

          return status;
        }
      }
    } catch (error) {
      logger.error({ appId: appData._id, error }, "Error processing request");

      throw error;
    }
  }

  protected async getWeekBusyEvents(
    appId: string,
    weekIdentifier: WeekIdentifier,
  ): Promise<Schedule> {
    const logger = this.loggerFactory("getWeekBusyEvents");
    logger.debug({ appId, week: weekIdentifier }, "Getting week busy events");

    try {
      const db = await this.props.getDbConnection();
      const collection = db.collection<BusyEventsEntity>(
        BUSY_EVENTS_COLLECTION_NAME,
      );

      const result = await collection.findOne({
        appId,
        week: weekIdentifier,
        companyId: this.props.companyId,
      });

      const schedule = result?.schedule || [];
      logger.debug(
        { appId, week: weekIdentifier, eventCount: schedule.length },
        "Found week busy events",
      );

      return schedule;
    } catch (error) {
      logger.error(
        { appId, week: weekIdentifier, error },
        "Error getting week busy events",
      );

      throw error;
    }
  }

  protected async setBusyEvents(
    appId: string,
    week: WeekIdentifier,
    schedule: Schedule,
  ): Promise<void> {
    const logger = this.loggerFactory("setBusyEvents");
    logger.debug(
      { appId, week, scheduleLength: schedule.length },
      "Setting busy events",
    );

    try {
      const db = await this.props.getDbConnection();
      const events = db.collection<BusyEventsEntity>(
        BUSY_EVENTS_COLLECTION_NAME,
      );

      const updateResult = await events.updateOne(
        { week, appId, companyId: this.props.companyId },
        {
          $set: {
            schedule,
          },
          $setOnInsert: {
            appId,
            week,
            _id: new ObjectId().toString(),
          },
        },
        { upsert: true },
      );

      logger.debug(
        {
          appId,
          week,
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount,
          upsertedCount: updateResult.upsertedCount,
        },
        "Update result",
      );
    } catch (error) {
      logger.error({ appId, week, error }, "Error setting busy events");
      throw error;
    }
  }

  public async getBusyTimes(
    { _id: appId }: ConnectedAppData,
    start: Date,
    end: Date,
  ): Promise<CalendarBusyTime[]> {
    const logger = this.loggerFactory("getBusyTimes");
    const t = await getI18nAsync<
      BusyEventsPublicNamespace,
      BusyEventsPublicKeys
    >(busyEventsPublicNamespace);
    logger.debug(
      { appId, start: start.toISOString(), end: end.toISOString() },
      "Getting busy times",
    );

    try {
      const days = eachOfInterval(start, end, "day");
      logger.debug({ appId, dayCount: days.length }, "Processing days");

      const weekMap = days.reduce(
        (map, day) => ({
          ...map,
          [day.toISODate()!]: getWeekIdentifier(day),
        }),
        {} as Record<string, WeekIdentifier>,
      );

      const weeks = Array.from(
        new Set(Object.values(weekMap).map((week) => week)),
      );

      logger.debug(
        { appId, weekCount: weeks.length, weeks },
        "Unique weeks found",
      );

      const db = await this.props.getDbConnection();
      const busyEvents = db.collection<BusyEventsEntity>(
        BUSY_EVENTS_COLLECTION_NAME,
      );

      logger.debug({ appId, weeks }, "Querying database for weeks");
      const weeksOverrides = await busyEvents
        .find({
          appId,
          week: {
            $in: weeks,
          },
          companyId: this.props.companyId,
        })
        .toArray();

      logger.debug(
        { appId, overrideCount: weeksOverrides.length },
        "Found week overrides in database",
      );

      const weeksOverridesMap = weeksOverrides.reduce(
        (map, weeksOverride) => ({
          ...map,
          [weeksOverride.week]: weeksOverride.schedule,
        }),
        {} as Record<WeekIdentifier, Schedule>,
      );

      const events = days.flatMap((day) => {
        const week = getWeekIdentifier(day);
        const weekEvents = weeksOverridesMap[week];

        const weekDay = day.weekday;
        const dayEvents = weekEvents?.find(
          (s) => s.weekDay === weekDay,
        )?.shifts;

        if (!dayEvents) return [];

        return dayEvents.map((event, index) => ({
          endAt: day.set(parseTime(event.end)).toJSDate(),
          startAt: day.set(parseTime(event.start)).toJSDate(),
          uid: `busy-event-${day.toISODate()}-${index}`,
          title: t("eventTitle"),
        }));
      });

      logger.info(
        {
          appId,
          eventCount: events.length,
        },
        "Generated busy time events",
      );

      return events;
    } catch (error) {
      logger.error({ appId, error }, "Error getting busy times");
      throw error;
    }
  }
}
