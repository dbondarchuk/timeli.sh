import { getLoggerFactory, LoggerFactory } from "@vivid/logger";
import { ConnectedAppError, IConnectedAppProps, WithTotal } from "@vivid/types";
import { buildSearchQuery, escapeRegex } from "@vivid/utils";
import { DateTime } from "luxon";
import { ObjectId, type Filter, type Sort } from "mongodb";
import {
  GetScheduledNotificationsAction,
  ScheduledNotification,
  ScheduledNotificationUpdateModel,
} from "./models";
import { ScheduledNotificationsAdminAllKeys } from "./translations/types";

const SCHEDULED_NOTIFICATIONS_COLLECTION_NAME = "scheduled-notifications";

export class ScheduledNotificationsRepository {
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "ScheduledNotificationsRepository",
      props.companyId,
    );
  }

  public async getScheduledNotification(appId: string, id: string) {
    const logger = this.loggerFactory("getScheduledNotification");
    logger.debug(
      { appId, companyId: this.props.companyId, scheduledNotificationId: id },
      "Getting scheduled notification",
    );

    try {
      const db = await this.props.getDbConnection();

      const scheduledNotification = await db
        .collection<ScheduledNotification>(
          SCHEDULED_NOTIFICATIONS_COLLECTION_NAME,
        )
        .findOne({
          appId,
          companyId: this.props.companyId,
          _id: id,
        });

      if (scheduledNotification) {
        logger.debug(
          {
            appId,
            scheduledNotificationId: id,
            scheduledNotificationName: scheduledNotification.name,
          },
          "Successfully retrieved scheduled notification",
        );
      } else {
        logger.debug(
          { appId, scheduledNotificationId: id },
          "Scheduled notification not found",
        );
      }

      return scheduledNotification;
    } catch (error: any) {
      logger.error(
        {
          appId,
          scheduledNotificationId: id,
          error: error?.message || error?.toString(),
        },
        "Error getting scheduled notification",
      );
      throw error;
    }
  }

  public async getScheduledNotifications(
    appId: string,
    query: GetScheduledNotificationsAction["query"],
  ): Promise<WithTotal<ScheduledNotification>> {
    const logger = this.loggerFactory("getScheduledNotifications");
    logger.debug({ appId, query }, "Getting scheduled notifications");

    try {
      const db = await this.props.getDbConnection();

      const sort: Sort = query.sort?.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.id]: curr.desc ? -1 : 1,
        }),
        {},
      ) || { updatedAt: -1 };

      const filter: Filter<ScheduledNotification> = {
        appId,
      };

      if (query.channel) {
        filter.channel = {
          $in: query.channel,
        };
      }

      if (query.type) {
        filter.type = {
          $in: query.type,
        };
      }

      if (query.search) {
        const $regex = new RegExp(escapeRegex(query.search), "i");
        const queries = buildSearchQuery<ScheduledNotification>(
          { $regex },
          "name",
        );

        filter.$or = queries;
      }

      logger.debug(
        { appId, filter, sort, offset: query.offset, limit: query.limit },
        "Executing scheduled notifications query",
      );

      const [result] = await db
        .collection<ScheduledNotification>(
          SCHEDULED_NOTIFICATIONS_COLLECTION_NAME,
        )
        .aggregate([
          {
            $sort: sort,
          },
          {
            $match: filter,
          },
          {
            $project: {
              value: false,
            },
          },
          {
            $facet: {
              paginatedResults:
                query.limit === 0
                  ? undefined
                  : [
                      ...(typeof query.offset !== "undefined"
                        ? [{ $skip: query.offset }]
                        : []),
                      ...(typeof query.limit !== "undefined"
                        ? [{ $limit: query.limit }]
                        : []),
                    ],
              totalCount: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ])
        .toArray();

      const total = result.totalCount?.[0]?.count || 0;
      const items = result.paginatedResults || [];

      logger.debug(
        { appId, total, itemCount: items.length },
        "Successfully retrieved scheduled notifications",
      );

      return {
        total,
        items,
      };
    } catch (error: any) {
      logger.error(
        { appId, query, error: error?.message || error?.toString() },
        "Error getting scheduled notifications",
      );
      throw error;
    }
  }

  public async createScheduledNotification(
    appId: string,
    scheduledNotification: ScheduledNotificationUpdateModel,
  ): Promise<ScheduledNotification> {
    const logger = this.loggerFactory("createScheduledNotification");
    logger.debug(
      {
        appId,
        scheduledNotificationName: scheduledNotification.name,
        channel: scheduledNotification.channel,
        type: scheduledNotification.type,
        appointmentCount: scheduledNotification.appointmentCount,
      },
      "Creating scheduled notification",
    );

    try {
      const dbScheduledNotification: ScheduledNotification = {
        ...scheduledNotification,
        appId,
        _id: new ObjectId().toString(),
        updatedAt: DateTime.utc().toJSDate(),
      };

      const isUnique = await this.checkUniqueName(
        appId,
        scheduledNotification.name,
      );
      if (!isUnique) {
        logger.error(
          { appId, scheduledNotificationName: scheduledNotification.name },
          "Scheduled notification name already exists",
        );
        throw new ConnectedAppError(
          "app_scheduled-notifications_admin.form.name.validation.unique" satisfies ScheduledNotificationsAdminAllKeys,
        );
      }

      const db = await this.props.getDbConnection();
      const scheduledNotifications = db.collection<ScheduledNotification>(
        SCHEDULED_NOTIFICATIONS_COLLECTION_NAME,
      );

      await scheduledNotifications.insertOne(dbScheduledNotification);

      logger.info(
        {
          appId,
          scheduledNotificationId: dbScheduledNotification._id,
          scheduledNotificationName: scheduledNotification.name,
        },
        "Successfully created scheduled notification",
      );

      return dbScheduledNotification;
    } catch (error: any) {
      logger.error(
        {
          appId,
          scheduledNotificationName: scheduledNotification.name,
          error: error?.message || error?.toString(),
        },
        "Error creating scheduled notification",
      );
      throw error;
    }
  }

  public async updateScheduledNotification(
    appId: string,
    id: string,
    update: ScheduledNotificationUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updateScheduledNotification");
    logger.debug(
      {
        appId,
        scheduledNotificationId: id,
        scheduledNotificationName: update.name,
      },
      "Updating scheduled notification",
    );

    try {
      const db = await this.props.getDbConnection();
      const scheduledNotifications = db.collection<ScheduledNotification>(
        SCHEDULED_NOTIFICATIONS_COLLECTION_NAME,
      );

      const { _id, ...updateObj } = update as ScheduledNotification; // Remove fields in case it slips here

      const isUnique = await this.checkUniqueName(appId, update.name, id);
      if (!isUnique) {
        logger.error(
          {
            appId,
            scheduledNotificationId: id,
            scheduledNotificationName: update.name,
          },
          "Scheduled notification name already exists",
        );
        throw new ConnectedAppError(
          "app_scheduled-notifications_admin.form.name.validation.unique" satisfies ScheduledNotificationsAdminAllKeys,
        );
      }

      updateObj.updatedAt = DateTime.utc().toJSDate();

      await scheduledNotifications.updateOne(
        {
          _id: id,
        },
        {
          $set: updateObj,
        },
      );

      logger.info(
        {
          appId,
          scheduledNotificationId: id,
          scheduledNotificationName: update.name,
        },
        "Successfully updated scheduled notification",
      );
    } catch (error: any) {
      logger.error(
        {
          appId,
          scheduledNotificationId: id,
          scheduledNotificationName: update.name,
          error: error?.message || error?.toString(),
        },
        "Error updating scheduled notification",
      );
      throw error;
    }
  }

  public async deleteScheduledNotifications(
    appId: string,
    ids: string[],
  ): Promise<void> {
    const logger = this.loggerFactory("deleteScheduledNotifications");
    logger.debug(
      { appId, scheduledNotificationIds: ids },
      "Deleting scheduled notifications",
    );

    try {
      const db = await this.props.getDbConnection();
      const scheduledNotifications = db.collection<ScheduledNotification>(
        SCHEDULED_NOTIFICATIONS_COLLECTION_NAME,
      );

      await scheduledNotifications.deleteMany({
        appId,
        _id: {
          $in: ids,
        },
      });

      logger.info(
        { appId, scheduledNotificationIds: ids },
        "Successfully deleted scheduled notifications",
      );
    } catch (error: any) {
      logger.error(
        {
          appId,
          scheduledNotificationIds: ids,
          error: error?.message || error?.toString(),
        },
        "Error deleting scheduled notifications",
      );
      throw error;
    }
  }

  public async checkUniqueName(
    appId: string,
    name: string,
    id?: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkUniqueName");
    logger.debug(
      { appId, name, scheduledNotificationId: id },
      "Checking unique name",
    );

    try {
      const db = await this.props.getDbConnection();
      const scheduledNotifications = db.collection<ScheduledNotification>(
        SCHEDULED_NOTIFICATIONS_COLLECTION_NAME,
      );

      const filter: Filter<ScheduledNotification> = {
        name,
        appId,
      };

      if (id) {
        filter._id = {
          $ne: id,
        };
      }

      const result = scheduledNotifications.aggregate([
        {
          $match: filter,
        },
      ]);
      const isUnique = !(await result.hasNext());

      logger.debug(
        { appId, name, scheduledNotificationId: id, isUnique },
        "Name uniqueness check completed",
      );

      return isUnique;
    } catch (error: any) {
      logger.error(
        {
          appId,
          name,
          scheduledNotificationId: id,
          error: error?.message || error?.toString(),
        },
        "Error checking unique name",
      );
      throw error;
    }
  }

  public async onUninstall(appId: string): Promise<void> {
    const logger = this.loggerFactory("onUninstall");
    try {
      const db = await this.props.getDbConnection();
      const collection = db.collection<ScheduledNotification>(
        SCHEDULED_NOTIFICATIONS_COLLECTION_NAME,
      );

      logger.debug({ appId }, "Deleting scheduled notifications for app");

      await collection.deleteMany({
        appId,
      });

      const count = await collection.countDocuments({});
      if (count === 0) {
        logger.debug(
          { appId },
          "No scheduled notifications left, dropping collection",
        );
        await db.dropCollection(SCHEDULED_NOTIFICATIONS_COLLECTION_NAME);
      }

      logger.info({ appId }, "Successfully cleaned up scheduled notifications");
    } catch (error: any) {
      logger.error(
        { appId, error: error?.message || error?.toString() },
        "Error cleaning up scheduled notifications",
      );
      throw error;
    }
  }
}
