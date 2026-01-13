import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  DateRange,
  IConnectedAppProps,
  Query,
  WithTotal,
} from "@timelish/types";
import { buildSearchQuery, escapeRegex } from "@timelish/utils";
import { ObjectId, type Filter, type Sort } from "mongodb";
import {
  WaitlistEntry,
  WaitlistEntryEntity,
  WaitlistRequest,
  WaitlistStatus,
} from "../models";
import { IWaitlistHook } from "../models/waitlist-hook";
import { WaitlistAdminAllKeys } from "../translations/types";

export const WAITLIST_COLLECTION_NAME = "waitlist";

export class WaitlistRepositoryService {
  protected readonly loggerFactory: LoggerFactory;

  public constructor(
    protected readonly appId: string,
    protected readonly companyId: string,
    protected readonly getDbConnection: IConnectedAppProps["getDbConnection"],
    protected readonly services: IConnectedAppProps["services"],
  ) {
    this.loggerFactory = getLoggerFactory(
      "WaitlistRepositoryService",
      this.companyId,
    );
  }

  public async createWaitlistEntry(
    entry: WaitlistRequest,
  ): Promise<WaitlistEntry> {
    const logger = this.loggerFactory("createWaitlistEntry");
    logger.debug({ entry }, "Creating waitlist entry");

    const customer =
      await this.services.customersService.getOrUpsertCustomer(entry);

    const db = await this.getDbConnection();
    const waitlistEntry = {
      ...entry,
      _id: new ObjectId().toString(),
      customerId: customer._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
      companyId: this.companyId,
    } satisfies WaitlistEntryEntity;

    await db
      .collection<WaitlistEntryEntity>(WAITLIST_COLLECTION_NAME)
      .insertOne(waitlistEntry);

    logger.debug(
      { waitlistEntry },
      "Waitlist entry created, hydrating from db",
    );

    const entity = await this.getWaitlistEntry(waitlistEntry._id);

    logger.debug({ waitlistEntry }, "Waitlist entry created, executing hooks");

    await this.services.jobService.enqueueHook<
      IWaitlistHook,
      "onWaitlistEntryCreated"
    >("waitlist-hook", "onWaitlistEntryCreated", entity!);

    const waitlistEntriesCount = await this.getWaitlistEntriesCount(new Date());
    await this.services.dashboardNotificationsService.publishNotification({
      type: "waitlist-entry-created",
      badges: [
        {
          key: "waitlist_entries",
          count: waitlistEntriesCount.totalCount,
        },
      ],
      toast: {
        type: "info",
        title: {
          key: "app_waitlist_admin.notifications.newEntry" satisfies WaitlistAdminAllKeys,
        },
        message: {
          key: "app_waitlist_admin.notifications.newEntryMessage" satisfies WaitlistAdminAllKeys,
        },
        action: {
          label: {
            key: "app_waitlist_admin.notifications.viewWaitlist" satisfies WaitlistAdminAllKeys,
          },
          href: `/dashboard?activeTab=waitlist&key=${Date.now()}`,
        },
      },
    });

    return entity!;
  }

  public async getWaitlistEntriesCount(
    date?: Date,
  ): Promise<{ newCount: number; totalCount: number }> {
    const logger = this.loggerFactory("getWaitlistEntriesCount");
    logger.debug({ date }, "Getting waitlist entries count");

    const db = await this.getDbConnection();
    const collection = db.collection<WaitlistEntryEntity>(
      WAITLIST_COLLECTION_NAME,
    );

    const $and: Filter<WaitlistEntryEntity>[] = [
      {
        companyId: this.companyId,
      },
      {
        status: "active",
      },
      {
        $or: [
          { asSoonAsPossible: { $eq: true } },
          { "dates.date": { $gte: new Date().toISOString().split("T")[0] } },
        ],
      },
    ];

    const dateMatch = date
      ? [
          {
            $match: {
              createdAt: {
                $gte: date,
              },
            },
          },
        ]
      : [];

    const [result] = await collection
      .aggregate([
        {
          $match: {
            $and,
          },
        },
        {
          $facet: {
            newCount: [
              ...dateMatch,
              {
                $count: "count",
              },
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
      newCount: result.newCount?.[0]?.count || 0,
      totalCount: result.totalCount?.[0]?.count || 0,
    };

    logger.debug({ date, response }, "Waitlist entries count retrieved");

    return response;
  }

  public async getWaitlistEntries(
    query: Query & {
      optionId?: string | string[];
      customerId?: string | string[];
      range?: DateRange;
      status?: WaitlistStatus[];
      ids?: string[];
    },
  ): Promise<WithTotal<WaitlistEntry>> {
    const logger = this.loggerFactory("getWaitlistEntries");
    logger.debug({ query }, "Getting waitlist entries");

    const db = await this.getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { createdAt: 1 };

    const $and: Filter<WaitlistEntry>[] = [
      {
        companyId: this.companyId,
      },
    ];
    if (query.range?.start || query.range?.end) {
      const dateConditions: Record<string, any> = {};

      // Since dates.date is stored as a string (ISO YYYY-MM-DD), comparing lexicographically works correctly for date ordering.

      const $or: Filter<WaitlistEntry>[] = [];
      $or.push({ asSoonAsPossible: { $eq: true } });

      if (query.range?.start) {
        dateConditions.$gte = query.range.start.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      if (query.range?.end) {
        dateConditions.$lte = query.range.end.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      $or.push({ "dates.date": dateConditions });
      $and.push({ $or });
    }

    if (query.customerId) {
      $and.push({
        customerId: {
          $in: Array.isArray(query.customerId)
            ? query.customerId
            : [query.customerId],
        },
      });
    }

    if (query.ids) {
      $and.push({
        _id: { $in: query.ids },
      });
    }

    if (query.optionId) {
      $and.push({
        "option._id": {
          $in: Array.isArray(query.optionId)
            ? query.optionId
            : [query.optionId],
        },
      });
    }

    if (query.status) {
      $and.push({
        status: { $in: query.status },
      });
    }

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<WaitlistEntry>(
        { $regex },
        "option.name",
        "addons.name",
        "addons.description",
        "name",
        "email",
        "phone",
        "customer.knownNames",
        "customer.knownEmails",
        "customer.knownPhones",
      );

      $and.push({ $or: queries });
    }

    const filter: Filter<WaitlistEntry> = $and.length > 0 ? { $and } : {};

    const [result] = await db
      .collection<WaitlistEntry>(WAITLIST_COLLECTION_NAME)
      .aggregate([
        ...this.waitlistAggregateJoin,
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

    logger.info(
      {
        result: { total: response.total, count: response.items.length },
        query,
      },
      "Fetched waitlist entries",
    );

    return response;
  }

  public async getWaitlistEntry(id: string): Promise<WaitlistEntry | null> {
    const logger = this.loggerFactory("getWaitlistEntry");
    logger.debug({ waitlistEntryId: id }, "Getting waitlist entry by id");

    const db = await this.getDbConnection();
    const waitlistEntry = await db
      .collection<WaitlistEntry>(WAITLIST_COLLECTION_NAME)
      .aggregate([
        ...this.waitlistAggregateJoin,
        {
          $match: { _id: id, companyId: this.companyId },
        },
      ])
      .next();

    if (!waitlistEntry) {
      logger.warn({ waitlistEntryId: id }, "Waitlist entry not found");
    } else {
      logger.debug(
        { waitlistEntryId: id, customerName: waitlistEntry.customer?.name },
        "Waitlist entry found",
      );
    }

    return waitlistEntry as WaitlistEntry | null;
  }

  public async dismissWaitlistEntry(id: string): Promise<WaitlistEntry | null> {
    const logger = this.loggerFactory("dismissWaitlistEntry");
    logger.debug({ waitlistEntryId: id }, "Dismissing waitlist entry by id");

    const entity = await this.getWaitlistEntry(id);
    if (!entity) {
      logger.warn({ waitlistEntryId: id }, "Waitlist entry not found");
      return null;
    }

    await this.dismissWaitlistEntries([id]);

    return entity;
  }

  public async dismissWaitlistEntries(ids: string[]): Promise<void> {
    const logger = this.loggerFactory("dismissWaitlistEntries");
    logger.debug(
      { waitlistEntryIds: ids },
      "Dismissing waitlist entries by ids",
    );

    const db = await this.getDbConnection();
    const { modifiedCount } = await db
      .collection<WaitlistEntryEntity>(WAITLIST_COLLECTION_NAME)
      .updateMany(
        { _id: { $in: ids }, companyId: this.companyId },
        { $set: { status: "dismissed", updatedAt: new Date() } },
      );

    logger.debug(
      { waitlistEntryIds: ids, modifiedCount },
      "Waitlist entries dismissed, executing hooks",
    );

    const waitlistEntries = await this.getWaitlistEntries({
      ids,
      status: ["dismissed"],
    });

    const entriesIds = waitlistEntries.items.map((entry) => entry._id);
    logger.debug(
      { waitlistEntryIds: entriesIds },
      "Waitlist entries dismissed, executing hooks",
    );

    await this.services.jobService.enqueueHook<
      IWaitlistHook,
      "onWaitlistEntryDismissed"
    >("waitlist-hook", "onWaitlistEntryDismissed", waitlistEntries.items);

    const waitlistEntriesCount = await this.getWaitlistEntriesCount(new Date());
    await this.services.dashboardNotificationsService.publishNotification({
      type: "waitlist-entries",
      badges: [
        {
          key: "waitlist_entries",
          count: waitlistEntriesCount.totalCount,
        },
      ],
    });
  }

  public async installWaitlistApp() {
    const logger = this.loggerFactory("installWaitlistApp");
    logger.debug("Installing waitlist app");

    const db = await this.getDbConnection();
    const collection = await db.createCollection<WaitlistEntry>(
      WAITLIST_COLLECTION_NAME,
    );

    const indexes = {
      companyId_createdAt_1: { companyId: 1, createdAt: 1 },
      companyId_status_1: { companyId: 1, status: 1 },
      companyId_customerId_1: { companyId: 1, customerId: 1 },
      companyId_optionId_1: { companyId: 1, optionId: 1 },
      companyId_asSoonAsPossible_1: { companyId: 1, asSoonAsPossible: 1 },
      companyId_dates_date_1: { companyId: 1, "dates.date": 1 },
    };

    for (const [name, index] of Object.entries(indexes)) {
      logger.debug(`Checking if index ${name} exists`);
      if (await collection.indexExists(name)) {
        logger.debug(`Index ${name} already exists`);
        continue;
      }

      logger.debug(`Creating index ${name}`);
      await collection.createIndex(index, { name });
    }

    logger.debug("Waitlist app installed");
  }

  private get waitlistAggregateJoin() {
    return [
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "options",
          localField: "optionId",
          foreignField: "_id",
          as: "option",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                duration: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "addons",
          localField: "addonsIds",
          foreignField: "_id",
          as: "addons",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                duration: 1,
              },
            },
          ],
        },
      },
      {
        $set: {
          customer: {
            $first: "$customer",
          },
          option: {
            $first: "$option",
          },
        },
      },
    ];
  }
}
