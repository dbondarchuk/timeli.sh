import {
  CommunicationChannel,
  CommunicationDirection,
  CommunicationLog,
  CommunicationLogEntity,
  CommunicationParticipantType,
  DateRange,
  ICommunicationLogsService,
  Query,
  WithTotal,
} from "@vivid/types";
import { buildSearchQuery, escapeRegex } from "@vivid/utils";
import { Filter, ObjectId, Sort } from "mongodb";
import {
  APPOINTMENTS_COLLECTION_NAME,
  CUSTOMERS_COLLECTION_NAME,
  LOG_COLLECTION_NAME,
} from "./collections";
import { getDbConnection } from "./database";
import { BaseService } from "./services/base.service";

export class CommunicationLogsService
  extends BaseService
  implements ICommunicationLogsService
{
  public constructor(companyId: string) {
    super("CommunicationLogsService", companyId);
  }

  public async log(
    log: Omit<CommunicationLogEntity, "dateTime" | "_id" | "companyId">,
  ) {
    const {
      channel,
      direction,
      appointmentId,
      customerId,
      participantType,
      participant,
    } = log;
    const logArgs = {
      channel,
      direction,
      appointmentId,
      customerId,
      participantType,
      participant,
    };

    const logger = this.loggerFactory("log");
    logger.debug({ logArgs }, "Logging new communication");
    const db = await getDbConnection();
    const collection =
      db.collection<CommunicationLogEntity>(LOG_COLLECTION_NAME);

    const _id = new ObjectId().toString();
    await collection.insertOne({
      ...log,
      companyId: this.companyId,
      dateTime: new Date(),
      _id,
    });

    logger.debug({ logArgs, _id }, "Successfully logged new communication");
  }

  public async getCommunicationLogs(
    query: Query & {
      direction?: CommunicationDirection[];
      channel?: CommunicationChannel[];
      participantType?: CommunicationParticipantType[];
      range?: DateRange;
      customerId?: string | string[];
      appointmentId?: string;
    },
  ): Promise<WithTotal<CommunicationLog>> {
    const logger = this.loggerFactory("getCommunicationLogs");
    logger.debug({ query }, "Getting communication logs");

    const db = await getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { dateTime: -1 };

    const filter: Filter<CommunicationLog> = {
      companyId: this.companyId,
    };

    if (query.range?.start || query.range?.end) {
      filter.dateTime = {};

      if (query.range.start) {
        filter.dateTime.$gte = query.range.start;
      }

      if (query.range.end) {
        filter.dateTime.$lte = query.range.end;
      }
    }

    if (query.direction && query.direction.length) {
      filter.direction = {
        $in: query.direction,
      };
    }

    if (query.channel && query.channel.length) {
      filter.channel = {
        $in: query.channel,
      };
    }

    if (query.participantType && query.participantType.length) {
      filter.participantType = {
        $in: query.participantType,
      };
    }

    if (query.appointmentId) {
      filter.appointmentId = query.appointmentId;
    } else if (query.customerId) {
      filter["customer._id"] = {
        $in: Array.isArray(query.customerId)
          ? query.customerId
          : [query.customerId],
      };
    }

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<CommunicationLog>(
        { $regex },
        "channel",
        "participant",
        // "handledBy",
        "text",
        "appointment.option.name",
        "customer.name",
        "subject",
      );

      filter.$or = queries;
    }

    const [result] = await db
      .collection<CommunicationLogEntity>(LOG_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            companyId: this.companyId,
          },
        },
        {
          $lookup: {
            from: APPOINTMENTS_COLLECTION_NAME,
            localField: "appointmentId",
            foreignField: "_id",
            as: "appointment",
            pipeline: [
              {
                $match: {
                  companyId: this.companyId,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: CUSTOMERS_COLLECTION_NAME,
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
            pipeline: [
              {
                $match: {
                  companyId: this.companyId,
                },
              },
            ],
          },
        },
        {
          $set: {
            appointment: {
              $first: "$appointment",
            },
            customer: {
              $first: "$customer",
            },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "appointment.customerId",
            foreignField: "_id",
            as: "appointmentCustomer",
            pipeline: [
              {
                $match: {
                  companyId: this.companyId,
                },
              },
            ],
          },
        },
        {
          $set: {
            customer: {
              $ifNull: ["$customer", { $first: "$appointmentCustomer" }],
            },
          },
        },
        {
          $unset: "appointmentCustomer",
        },
        {
          $match: filter,
        },
        {
          $sort: sort,
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

    const response = {
      total: result.totalCount?.[0]?.count || 0,
      items: result.paginatedResults || [],
    };

    logger.debug(
      {
        query,
        result: { total: response.total, count: response.items.length },
      },
      "Fetched communication logs",
    );

    return response;
  }

  public async clearAllLogs() {
    const logger = this.loggerFactory("clearAllLogs");
    logger.debug("Clearing all logs");

    const db = await getDbConnection();
    const collection = db.collection<CommunicationLog>(LOG_COLLECTION_NAME);

    const { deletedCount } = await collection.deleteMany({
      companyId: this.companyId,
    });

    logger.debug({ deletedCount }, "Cleared all logs");
  }

  public async clearSelectedLogs(ids: string[]) {
    const logger = this.loggerFactory("clearSelectedLogs");
    logger.debug({ ids }, "Clearing selected logs");
    const db = await getDbConnection();
    const collection = db.collection<CommunicationLog>(LOG_COLLECTION_NAME);

    const { deletedCount } = await collection.deleteMany({
      _id: {
        $in: ids,
      },
      companyId: this.companyId,
    });

    logger.debug({ ids, deletedCount }, "Cleared selected logs");
  }

  public async clearOldLogs(maxDate: Date) {
    const logger = this.loggerFactory("clearOldLogs");
    logger.debug({ maxDate }, "Clearing old logs");
    const db = await getDbConnection();
    const collection = db.collection<CommunicationLog>(LOG_COLLECTION_NAME);

    const { deletedCount } = await collection.deleteMany({
      dateTime: {
        $lt: maxDate,
      },
      companyId: this.companyId,
    });

    logger.debug({ maxDate, deletedCount }, "Cleared old logs");
  }
}
