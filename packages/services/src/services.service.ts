import { getLoggerFactory } from "@vivid/logger";
import {
  AddonsType,
  ApplyCustomerDiscountRequest,
  AppointmentAddon,
  AppointmentAddonUpdateModel,
  AppointmentEntity,
  AppointmentOption,
  AppointmentOptionUpdateModel,
  ConfigurationOption,
  DateRange,
  Discount,
  DiscountType,
  DiscountUpdateModel,
  FieldsType,
  FieldType,
  IConfigurationService,
  IServicesService,
  Query,
  ServiceField,
  ServiceFieldUpdateModel,
  WithTotal,
} from "@vivid/types";
import { buildSearchQuery, escapeRegex } from "@vivid/utils";
import { DateTime } from "luxon";
import { Filter, ObjectId, Sort } from "mongodb";
import { CONFIGURATION_COLLECTION_NAME } from "./configuration.service";
import { getDbClient, getDbConnection } from "./database";
import { APPOINTMENTS_COLLECTION_NAME } from "./events.service";

export const FIELDS_COLLECTION_NAME = "fields";
export const ADDONS_COLLECTION_NAME = "addons";
export const OPTIONS_COLLECTION_NAME = "options";
export const DISCOUNTS_COLLECTION_NAME = "discounts";

export class ServicesService implements IServicesService {
  protected readonly loggerFactory = getLoggerFactory("ServicesService");

  public constructor(
    protected readonly configurationService: IConfigurationService,
  ) {}

  /** Fields */

  public async getField(id: string): Promise<ServiceField | null> {
    const logger = this.loggerFactory("getField");
    logger.debug({ fieldId: id }, "Getting field by id");

    const db = await getDbConnection();
    const fields = db.collection<ServiceField>(FIELDS_COLLECTION_NAME);

    const field = await fields.findOne({
      _id: id,
    });

    if (!field) {
      logger.warn({ fieldId: id }, "Field not found");
    } else {
      logger.debug({ fieldId: id, name: field.name }, "Field found");
    }

    return field;
  }

  public async getFields<T extends boolean | undefined>(
    query: Query & {
      type: FieldType[];
    },
    includeUsage?: T,
  ): Promise<WithTotal<FieldsType<T>>> {
    const logger = this.loggerFactory("getFields");
    logger.debug({ query, includeUsage }, "Getting fields");

    const db = await getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { updatedAt: -1 };

    const filter: Filter<ServiceField> = {};

    if (query.type) {
      filter.type = {
        $in: query.type,
      };
    }

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<ServiceField>(
        { $regex },
        "name",
        "data.description",
        "data.label",
        "data.options",
      );

      filter.$or = queries;
    }

    const [result] = await db
      .collection<ServiceField>(FIELDS_COLLECTION_NAME)
      .aggregate([
        {
          $sort: sort,
        },
        {
          $match: filter,
        },
        ...(includeUsage
          ? [
              {
                $lookup: {
                  from: ADDONS_COLLECTION_NAME,
                  localField: "_id",
                  foreignField: "fields.id",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                      },
                    },
                  ],
                  as: "addons",
                },
              },
              {
                $lookup: {
                  from: OPTIONS_COLLECTION_NAME,
                  localField: "_id",
                  foreignField: "fields.id",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                      },
                    },
                  ],
                  as: "options",
                },
              },
            ]
          : []),
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
      "Fetched fields",
    );

    return response;
  }

  public async getFieldsByNames(names: string[]): Promise<ServiceField[]> {
    const logger = this.loggerFactory("getFieldsByNames");
    logger.debug({ names }, "Getting fields by names");

    const db = await getDbConnection();
    const fields = db.collection<ServiceField>(FIELDS_COLLECTION_NAME);

    const result = await fields
      .find({
        name: {
          $in: names,
        },
      })
      .toArray();

    logger.debug({ names, count: result.length }, "Fields found");

    return result;
  }

  public async getFieldsById(ids: string[]): Promise<ServiceField[]> {
    const logger = this.loggerFactory("getFieldsById");
    logger.debug({ ids }, "Getting fields by ids");

    const db = await getDbConnection();
    const fields = db.collection<ServiceField>(FIELDS_COLLECTION_NAME);

    const result = await fields
      .find({
        _id: {
          $in: ids,
        },
      })
      .toArray();

    logger.debug({ ids, count: result.length }, "Fields found");

    return result;
  }

  public async createField(
    field: ServiceFieldUpdateModel,
  ): Promise<ServiceField> {
    const logger = this.loggerFactory("createField");
    logger.debug(
      { field: { name: field.name, type: field.type } },
      "Creating new field",
    );

    const dbField: ServiceField = {
      ...field,
      _id: new ObjectId().toString(),
      updatedAt: DateTime.utc().toJSDate(),
    };

    if (!this.checkFieldUniqueName(field.name)) {
      logger.error({ name: field.name }, "Field name already exists");
      throw new Error("Name already exists");
    }

    const db = await getDbConnection();
    const fields = db.collection<ServiceField>(FIELDS_COLLECTION_NAME);

    await fields.insertOne(dbField);

    logger.debug(
      { fieldId: dbField._id, name: dbField.name },
      "Successfully created field",
    );

    return dbField;
  }

  public async updateField(
    id: string,
    update: ServiceFieldUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updateField");
    logger.debug({ id, update }, "Updating field");

    const db = await getDbConnection();
    const fields = db.collection<ServiceField>(FIELDS_COLLECTION_NAME);

    const { _id, ...updateObj } = update as ServiceField; // Remove fields in case it slips here

    if (!this.checkFieldUniqueName(update.name, id)) {
      throw new Error("Name already exists");
    }

    updateObj.updatedAt = DateTime.utc().toJSDate();

    await fields.updateOne(
      {
        _id: id,
      },
      {
        $set: updateObj,
      },
    );

    logger.debug({ fieldId: id, name: update.name }, "Field updated");
  }

  public async deleteField(id: string): Promise<ServiceField | null> {
    const logger = this.loggerFactory("deleteField");
    logger.debug({ id }, "Deleting field");

    const client = await getDbClient();
    const session = client.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const db = client.db(undefined, { ignoreUndefined: true });
        const fields = db.collection<ServiceField>(FIELDS_COLLECTION_NAME);

        const field = await fields.findOneAndDelete({ _id: id });
        if (!field) {
          logger.warn({ fieldId: id }, "Field not found");
          return null;
        }

        const addons = db.collection<AppointmentAddon>(ADDONS_COLLECTION_NAME);
        const options = db.collection<AppointmentOption>(
          OPTIONS_COLLECTION_NAME,
        );
        const { modifiedCount: addonsModifiedCount } = await addons.updateMany(
          {},
          {
            $pull: {
              fields: {
                id,
              },
            },
          },
        );

        const { modifiedCount: optionsModifiedCount } =
          await options.updateMany(
            {},
            {
              $pull: {
                fields: {
                  id,
                },
              },
            },
          );

        logger.debug(
          { fieldId: id, addonsModifiedCount, optionsModifiedCount },
          "Field deleted",
        );

        return field;
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  public async deleteFields(ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deleteFields");
    logger.debug({ ids }, "Deleting fields");

    const client = await getDbClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const db = client.db(undefined, { ignoreUndefined: true });
        const fields = db.collection<ServiceField>(FIELDS_COLLECTION_NAME);

        const { deletedCount: fieldsDeletedCount } = await fields.deleteMany({
          _id: {
            $in: ids,
          },
        });

        const addons = db.collection<AppointmentAddon>(ADDONS_COLLECTION_NAME);
        const options = db.collection<AppointmentOption>(
          OPTIONS_COLLECTION_NAME,
        );
        const { modifiedCount: addonsModifiedCount } = await addons.updateMany(
          {},
          {
            $pull: {
              fields: {
                id: {
                  $in: ids,
                },
              },
            },
          },
        );

        const { modifiedCount: optionsModifiedCount } =
          await options.updateMany(
            {},
            {
              $pull: {
                fields: {
                  id: {
                    $in: ids,
                  },
                },
              },
            },
          );

        logger.debug(
          { fieldsDeletedCount, addonsModifiedCount, optionsModifiedCount },
          "Fields deleted",
        );
      });
    } finally {
      await session.endSession();
    }
  }

  public async checkFieldUniqueName(
    name: string,
    id?: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkFieldUniqueName");
    logger.debug({ name, id }, "Checking field unique name");

    const db = await getDbConnection();
    const fields = db.collection<ServiceField>(FIELDS_COLLECTION_NAME);

    const filter: Filter<ServiceField> = {
      name,
    };

    if (id) {
      filter._id = {
        $ne: id,
      };
    }

    const hasNext = await fields.aggregate([{ $match: filter }]).hasNext();
    logger.debug({ name, id, hasNext }, "Field unique name check result");
    return !hasNext;
  }

  /** Addons */

  public async getAddon(id: string): Promise<AppointmentAddon | null> {
    const logger = this.loggerFactory("getAddon");
    logger.debug({ id }, "Getting addon");

    const db = await getDbConnection();
    const addons = db.collection<AppointmentAddon>(ADDONS_COLLECTION_NAME);

    const result = await addons.findOne({
      _id: id,
    });

    if (!result) {
      logger.warn({ addonId: id }, "Addon not found");
    } else {
      logger.debug({ addonId: id, name: result.name }, "Addon found");
    }

    return result;
  }

  public async getAddonsById(ids: string[]): Promise<AppointmentAddon[]> {
    const logger = this.loggerFactory("getAddonsById");
    logger.debug({ ids }, "Getting addons by ids");

    const db = await getDbConnection();
    const addons = db.collection<AppointmentAddon>(ADDONS_COLLECTION_NAME);

    const result = await addons
      .find({
        _id: {
          $in: ids,
        },
      })
      .toArray();

    logger.debug({ ids, count: result.length }, "Addons found");

    return result;
  }

  public async getAddons<T extends boolean | undefined>(
    query: Query,
    includeUsage?: T,
  ): Promise<WithTotal<AddonsType<T>>> {
    const logger = this.loggerFactory("getAddons");
    logger.debug({ query, includeUsage }, "Getting addons");
    const db = await getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { updatedAt: -1 };

    const filter: Filter<AppointmentAddon> = {};

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<AppointmentAddon>(
        { $regex },
        "name",
        "duration",
        "price",
        "description",
      );

      filter.$or = queries;
    }

    const [result] = await db
      .collection<AppointmentAddon>(ADDONS_COLLECTION_NAME)
      .aggregate([
        {
          $sort: sort,
        },
        {
          $match: filter,
        },
        ...(includeUsage
          ? [
              {
                $lookup: {
                  from: OPTIONS_COLLECTION_NAME,
                  localField: "_id",
                  foreignField: "addons.id",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                      },
                    },
                  ],
                  as: "options",
                },
              },
            ]
          : []),
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
        includeUsage,
        result: { total: response.total, count: response.items.length },
      },
      "Fetched addons",
    );

    return response;
  }

  public async createAddon(
    addon: AppointmentAddonUpdateModel,
  ): Promise<AppointmentAddon> {
    const logger = this.loggerFactory("createAddon");
    logger.debug({ addon }, "Creating addon");
    const dbAddon: AppointmentAddon = {
      ...addon,
      _id: new ObjectId().toString(),
      updatedAt: DateTime.utc().toJSDate(),
    };

    if (!this.checkAddonUniqueName(addon.name)) {
      throw new Error("Name already exists");
    }

    const db = await getDbConnection();
    const addons = db.collection<AppointmentAddon>(ADDONS_COLLECTION_NAME);

    await addons.insertOne(dbAddon);

    logger.debug({ addonId: dbAddon._id, name: dbAddon.name }, "Addon created");

    return dbAddon;
  }

  public async updateAddon(
    id: string,
    update: AppointmentAddonUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updateAddon");
    logger.debug({ id, update }, "Updating addon");
    const db = await getDbConnection();
    const addons = db.collection<AppointmentAddon>(ADDONS_COLLECTION_NAME);

    const { _id, ...updateObj } = update as AppointmentAddon; // Remove fields in case it slips here

    if (!this.checkAddonUniqueName(update.name, id)) {
      throw new Error("Name already exists");
    }

    updateObj.updatedAt = DateTime.utc().toJSDate();

    await addons.updateOne(
      {
        _id: id,
      },
      {
        $set: updateObj,
      },
    );

    logger.debug({ addonId: id, name: update.name }, "Addon updated");
  }

  public async deleteAddon(id: string): Promise<AppointmentAddon | null> {
    const logger = this.loggerFactory("deleteAddon");
    logger.debug({ id }, "Deleting addon");
    const client = await getDbClient();
    const session = client.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const db = client.db(undefined, { ignoreUndefined: true });
        const addons = db.collection<AppointmentAddon>(ADDONS_COLLECTION_NAME);

        const addon = await addons.findOneAndDelete({ _id: id });
        if (!addon) {
          logger.warn({ addonId: id }, "Addon not found");
          return null;
        }

        const options = db.collection<AppointmentOption>(
          OPTIONS_COLLECTION_NAME,
        );

        const { modifiedCount: optionsModifiedCount } =
          await options.updateMany(
            {},
            {
              $pull: {
                addons: {
                  id,
                },
              },
            },
          );

        logger.debug({ addonId: id, optionsModifiedCount }, "Addon deleted");

        return addon;
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  public async deleteAddons(ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deleteAddons");
    logger.debug({ ids }, "Deleting addons");
    const client = await getDbClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const db = client.db(undefined, { ignoreUndefined: true });
        const addons = db.collection<AppointmentAddon>(ADDONS_COLLECTION_NAME);

        const { deletedCount: addonsDeletedCount } = await addons.deleteMany({
          _id: {
            $in: ids,
          },
        });

        const options = db.collection<AppointmentOption>(
          OPTIONS_COLLECTION_NAME,
        );
        const { modifiedCount: optionsModifiedCount } =
          await options.updateMany(
            {},
            {
              $pull: {
                addons: {
                  id: {
                    $in: ids,
                  },
                },
              },
            },
          );

        logger.debug(
          { addonsDeletedCount, optionsModifiedCount },
          "Addons deleted",
        );
      });
    } finally {
      await session.endSession();
    }
  }

  public async checkAddonUniqueName(
    name: string,
    id?: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkAddonUniqueName");
    logger.debug({ name, id }, "Checking addon unique name");
    const db = await getDbConnection();
    const addons = db.collection<AppointmentAddon>(ADDONS_COLLECTION_NAME);

    const filter: Filter<AppointmentAddon> = {
      name,
    };

    if (id) {
      filter._id = {
        $ne: id,
      };
    }

    const hasNext = await addons.aggregate([{ $match: filter }]).hasNext();
    logger.debug({ name, id, hasNext }, "Addon unique name check result");
    return !hasNext;
  }

  /** Options */

  public async getOption(id: string): Promise<AppointmentOption | null> {
    const logger = this.loggerFactory("getOption");
    logger.debug({ id }, "Getting option");
    const db = await getDbConnection();
    const options = db.collection<AppointmentOption>(OPTIONS_COLLECTION_NAME);

    const option = await options.findOne({
      _id: id,
    });

    if (!option) {
      logger.warn({ optionId: id }, "Option not found");
    } else {
      logger.debug({ optionId: id, name: option.name }, "Option found");
    }

    return option;
  }

  public async getOptions(
    query: Query & { priorityIds?: string[] },
  ): Promise<WithTotal<AppointmentOption>> {
    const logger = this.loggerFactory("getOptions");
    logger.debug({ query }, "Getting options");
    const db = await getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { updatedAt: -1 };

    const filter: Filter<AppointmentOption> = {};

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<AppointmentOption>(
        { $regex },
        "name",
        "duration",
        "price",
        "description",
      );

      filter.$or = queries;
    }

    const priorityStages = query.priorityIds
      ? [
          {
            $facet: {
              priority: [
                {
                  $match: {
                    _id: {
                      $in: query.priorityIds,
                    },
                  },
                },
              ],
              other: [
                {
                  $match: {
                    ...filter,
                    _id: {
                      $nin: query.priorityIds,
                    },
                  },
                },
                {
                  $sort: sort,
                },
              ],
            },
          },
          {
            $project: {
              values: {
                $concatArrays: ["$priority", "$other"],
              },
            },
          },
          {
            $unwind: {
              path: "$values",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$values",
            },
          },
        ]
      : [
          {
            $match: filter,
          },
          {
            $sort: sort,
          },
        ];

    const [result] = await db
      .collection<AppointmentOption>(OPTIONS_COLLECTION_NAME)
      .aggregate([
        ...priorityStages,
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
      "Fetched options",
    );

    return response;
  }

  public async createOption(
    addon: AppointmentOptionUpdateModel,
  ): Promise<AppointmentOption> {
    const logger = this.loggerFactory("createOption");
    logger.debug({ addon }, "Creating option");
    const dbOption: AppointmentOption = {
      ...addon,
      _id: new ObjectId().toString(),
      updatedAt: DateTime.utc().toJSDate(),
    };

    if (!this.checkOptionUniqueName(addon.name)) {
      throw new Error("Name already exists");
    }

    const db = await getDbConnection();
    const options = db.collection<AppointmentOption>(OPTIONS_COLLECTION_NAME);

    await options.insertOne(dbOption);

    logger.debug(
      { optionId: dbOption._id, name: dbOption.name },
      "Option created",
    );

    return dbOption;
  }

  public async updateOption(
    id: string,
    update: AppointmentOptionUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updateOption");
    logger.debug({ id, update }, "Updating option");
    const db = await getDbConnection();
    const options = db.collection<AppointmentOption>(OPTIONS_COLLECTION_NAME);

    const { _id, ...updateObj } = update as AppointmentOption; // Remove fields in case it slips here

    if (!this.checkOptionUniqueName(update.name, id)) {
      throw new Error("Name already exists");
    }

    updateObj.updatedAt = DateTime.utc().toJSDate();

    await options.updateOne(
      {
        _id: id,
      },
      {
        $set: updateObj,
      },
    );

    logger.debug({ optionId: id, name: update.name }, "Option updated");
  }

  public async deleteOption(id: string): Promise<AppointmentOption | null> {
    const logger = this.loggerFactory("deleteOption");
    logger.debug({ id }, "Deleting option");
    const client = await getDbClient();
    const session = client.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const db = client.db(undefined, { ignoreUndefined: true });
        const options = db.collection<AppointmentOption>(
          OPTIONS_COLLECTION_NAME,
        );

        const option = await options.findOneAndDelete({ _id: id });
        if (!option) {
          logger.warn({ optionId: id }, "Option not found");
          return null;
        }

        const configurations = db.collection<ConfigurationOption<"booking">>(
          CONFIGURATION_COLLECTION_NAME,
        );

        const { modifiedCount: configurationsModifiedCount } =
          await configurations.updateOne(
            {
              key: "booking",
            },
            {
              $pull: {
                "value.options": {
                  id,
                },
              },
            },
          );

        logger.debug(
          { optionId: id, configurationsModifiedCount },
          "Option deleted",
        );

        return option;
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  public async deleteOptions(ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deleteOptions");
    logger.debug({ ids }, "Deleting options");
    const client = await getDbClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const db = client.db(undefined, { ignoreUndefined: true });
        const options = db.collection<AppointmentOption>(
          OPTIONS_COLLECTION_NAME,
        );

        const { deletedCount: optionsDeletedCount } = await options.deleteMany({
          _id: {
            $in: ids,
          },
        });

        const configurations = db.collection<ConfigurationOption<"booking">>(
          CONFIGURATION_COLLECTION_NAME,
        );

        const { modifiedCount: configurationsModifiedCount } =
          await configurations.updateOne(
            {
              key: "booking",
            },
            {
              $pull: {
                "value.options": {
                  id: {
                    $in: ids,
                  },
                },
              },
            },
          );

        logger.debug(
          { optionsDeletedCount, configurationsModifiedCount },
          "Options deleted",
        );
      });
    } finally {
      await session.endSession();
    }
  }

  public async checkOptionUniqueName(
    name: string,
    id?: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkOptionUniqueName");
    logger.debug({ name, id }, "Checking option unique name");
    const db = await getDbConnection();
    const options = db.collection<AppointmentOption>(OPTIONS_COLLECTION_NAME);

    const filter: Filter<AppointmentOption> = {
      name,
    };

    if (id) {
      filter._id = {
        $ne: id,
      };
    }

    const hasNext = await options.aggregate([{ $match: filter }]).hasNext();
    logger.debug({ name, id, hasNext }, "Option unique name check result");
    return !hasNext;
  }

  /** Discounts */

  public async getDiscount(id: string): Promise<Discount | null> {
    const logger = this.loggerFactory("getDiscount");
    logger.debug({ id }, "Getting discount");
    const db = await getDbConnection();
    const discounts = db.collection<Discount>(DISCOUNTS_COLLECTION_NAME);

    const result = await discounts.findOne({
      _id: id,
    });

    if (!result) {
      logger.warn({ discountId: id }, "Discount not found");
    } else {
      logger.debug({ discountId: id, name: result.name }, "Discount found");
    }

    return result;
  }

  public async getDiscountByCode(code: string): Promise<Discount | null> {
    const logger = this.loggerFactory("getDiscountByCode");
    logger.debug({ code }, "Getting discount by code");
    const db = await getDbConnection();
    const discounts = db.collection<Discount>(DISCOUNTS_COLLECTION_NAME);

    const result = await discounts.findOne({
      codes: code,
    });

    if (!result) {
      logger.warn({ discountCode: code }, "Discount not found");
    } else {
      logger.debug({ discountCode: code, name: result.name }, "Discount found");
    }

    return result;
  }

  public async getDiscounts(
    query: Query & {
      enabled?: boolean[];
      type?: DiscountType[];
      range?: DateRange;
      priorityIds?: string[];
    },
  ): Promise<
    WithTotal<
      Discount & {
        usedCount: number;
      }
    >
  > {
    const logger = this.loggerFactory("getDiscounts");
    logger.debug({ query }, "Getting discounts");
    const db = await getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { updatedAt: -1 };

    const $and: Filter<Discount>[] = [];

    if (query.type) {
      $and.push({
        type: {
          $in: query.type,
        },
      });
    }

    if (query.range?.start || query.range?.end) {
      if (query.range.start) {
        $and.push({
          $or: [
            {
              endDate: { $gte: query.range.start },
            },
            {
              endDate: { $exists: false },
            },
          ],
        });
      }

      if (query.range.end) {
        $and.push({
          $or: [
            {
              startDate: { $lte: query.range.end },
            },
            {
              startDate: { $exists: false },
            },
          ],
        });
      }
    }

    if (query.enabled?.length === 1) {
      $and.push({
        enabled: query.enabled[0],
      });
    }

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<Discount>({ $regex }, "name", "codes");

      $and.push({
        $or: queries,
      });
    }

    const filter: Filter<Discount> = {
      $and,
    };

    const priorityStages = query.priorityIds
      ? [
          {
            $facet: {
              priority: [
                {
                  $match: {
                    _id: {
                      $in: query.priorityIds,
                    },
                  },
                },
              ],
              other: [
                {
                  $match: {
                    ...filter,
                    _id: {
                      $nin: query.priorityIds,
                    },
                  },
                },
                {
                  $sort: sort,
                },
              ],
            },
          },
          {
            $project: {
              values: {
                $concatArrays: ["$priority", "$other"],
              },
            },
          },
          {
            $unwind: {
              path: "$values",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$values",
            },
          },
        ]
      : [
          {
            $match: filter,
          },
          {
            $sort: sort,
          },
        ];

    const [result] = await db
      .collection<Discount>(DISCOUNTS_COLLECTION_NAME)
      .aggregate([
        {
          $lookup: {
            from: APPOINTMENTS_COLLECTION_NAME,
            localField: "_id",
            foreignField: "discount.id",
            as: "usedCount",
          },
        },
        {
          $set: {
            usedCount: {
              $size: "$usedCount",
            },
          },
        },
        ...priorityStages,
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
      "Fetched discounts",
    );

    return response;
  }

  public async createDiscount(
    discount: DiscountUpdateModel,
  ): Promise<Discount> {
    const logger = this.loggerFactory("createDiscount");
    logger.debug({ discount }, "Creating discount");
    const dbDiscount: Discount = {
      ...discount,
      _id: new ObjectId().toString(),
      updatedAt: DateTime.utc().toJSDate(),
    };

    if (!this.checkDiscountUniqueNameAndCode(discount.name, discount.codes)) {
      logger.error({ discount }, "Discount name or code already exists");
      throw new Error("Name or code already exists");
    }

    const db = await getDbConnection();
    const discounts = db.collection<Discount>(DISCOUNTS_COLLECTION_NAME);

    await discounts.insertOne(dbDiscount);

    logger.debug(
      { discountId: dbDiscount._id, name: dbDiscount.name },
      "Discount created",
    );

    return dbDiscount;
  }

  public async updateDiscount(
    id: string,
    update: DiscountUpdateModel,
  ): Promise<void> {
    const logger = this.loggerFactory("updateDiscount");
    logger.debug({ id, update }, "Updating discount");
    const db = await getDbConnection();
    const discounts = db.collection<Discount>(DISCOUNTS_COLLECTION_NAME);

    const { _id, ...updateObj } = update as Discount; // Remove fields in case it slips here

    if (!this.checkDiscountUniqueNameAndCode(update.name, update.codes, id)) {
      logger.error(
        { discount: update },
        "Discount name or code already exists",
      );
      throw new Error("Name or code already exists");
    }

    updateObj.updatedAt = DateTime.utc().toJSDate();

    await discounts.updateOne(
      {
        _id: id,
      },
      {
        $set: updateObj,
      },
    );

    logger.debug({ discountId: id, name: update.name }, "Discount updated");
  }

  public async deleteDiscount(id: string): Promise<Discount | null> {
    const logger = this.loggerFactory("deleteDiscount");
    logger.debug({ id }, "Deleting discount");
    const client = await getDbClient();
    const session = client.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const db = client.db(undefined, { ignoreUndefined: true });
        const discounts = db.collection<Discount>(DISCOUNTS_COLLECTION_NAME);

        const discount = await discounts.findOneAndDelete({ _id: id });
        if (!discount) {
          logger.warn({ discountId: id }, "Discount not found");
          return null;
        }

        logger.debug({ discountId: id }, "Discount deleted");

        return discount;
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  public async deleteDiscounts(ids: string[]): Promise<void> {
    const logger = this.loggerFactory("deleteDiscounts");
    logger.debug({ ids }, "Deleting discounts");
    const client = await getDbClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const db = client.db(undefined, { ignoreUndefined: true });
        const discounts = db.collection<Discount>(DISCOUNTS_COLLECTION_NAME);

        const { deletedCount: discountsDeletedCount } =
          await discounts.deleteMany({
            _id: {
              $in: ids,
            },
          });

        logger.debug({ ids, discountsDeletedCount }, "Discounts deleted");
      });
    } finally {
      await session.endSession();
    }
  }

  public async checkDiscountUniqueNameAndCode(
    name: string,
    codes: string[],
    id?: string,
  ): Promise<{ name: boolean; code: Record<string, boolean> }> {
    const logger = this.loggerFactory("checkDiscountUniqueNameAndCode");
    logger.debug({ name, codes, id }, "Checking discount unique name and code");

    const db = await getDbConnection();
    const discounts = db.collection<Discount>(DISCOUNTS_COLLECTION_NAME);

    const nameFilter: Filter<Discount> = {
      name,
    };

    const codeFilter: Filter<Discount> = {};

    if (id) {
      nameFilter._id = {
        $ne: id,
      };
      codeFilter._id = {
        $ne: id,
      };
    }

    const codesAgg = codes?.length
      ? discounts.aggregate([
          {
            $facet: codes.reduce(
              (map, code) => ({
                ...map,
                [code]: [
                  {
                    $match: {
                      ...codeFilter,
                      code,
                    },
                  },
                  {
                    $count: "count",
                  },
                ],
              }),
              {},
            ),
          },
        ])
      : { toArray: () => Promise.resolve([]) };

    const [nameResult, codeResult] = await Promise.all([
      discounts.find(nameFilter).hasNext(),
      codesAgg.toArray(),
    ]);

    const result = {
      name: !nameResult,
      code: codeResult?.length
        ? Object.entries(codeResult[0]).reduce(
            (map, [code, val]) => ({
              ...map,
              [code]: !val[0]?.count,
            }),
            {},
          )
        : {},
    };

    logger.debug(
      { name, codes, id, result },
      "Discount unique name and code check result",
    );

    return result;
  }

  public async applyDiscount(
    request: ApplyCustomerDiscountRequest,
  ): Promise<Discount | null> {
    const logger = this.loggerFactory("applyDiscount");
    logger.debug({ request }, "Applying discount");
    const discount = await this.getDiscountByCode(request.code);
    if (!discount) {
      logger.debug({ request }, "Discount not found");
      return null;
    }

    const { timeZone } =
      await this.configurationService.getConfiguration("general");

    const now = DateTime.now().setZone(timeZone);

    if (
      discount.startDate &&
      DateTime.fromJSDate(discount.startDate).setZone(timeZone) > now
    ) {
      logger.debug(
        { request, discount },
        "Discount start date is in the future",
      );
      return null;
    }

    if (
      discount.endDate &&
      DateTime.fromJSDate(discount.endDate).setZone(timeZone) < now
    ) {
      logger.debug({ request, discount }, "Discount end date is in the past");
      return null;
    }

    if (
      discount.appointmentStartDate &&
      DateTime.fromJSDate(discount.appointmentStartDate).setZone(timeZone) >
        DateTime.fromJSDate(request.dateTime).setZone(timeZone)
    ) {
      logger.debug(
        { request, discount },
        "Discount appointment start date is in the future",
      );
      return null;
    }

    if (
      discount.appointmentEndDate &&
      DateTime.fromJSDate(discount.appointmentEndDate).setZone(timeZone) <
        DateTime.fromJSDate(request.dateTime).setZone(timeZone)
    ) {
      logger.debug(
        { request, discount },
        "Discount appointment end date is in the past",
      );
      return null;
    }

    if (discount.limitTo?.length) {
      const hasAny = discount.limitTo.some((limit) => {
        if (
          limit.options?.length &&
          !limit.options.some((o) => o.id === request.optionId)
        ) {
          logger.debug(
            { request, discount },
            "Discount limit to option not found",
          );
          return false;
        }

        if (limit.addons?.length) {
          const hasAddonIntersection = limit.addons.some((bundle) =>
            bundle.ids.every(({ id: bId }) =>
              request.addons?.some((aId) => aId === bId),
            ),
          );

          if (!hasAddonIntersection) {
            logger.debug(
              { request, discount },
              "Discount limit to addon not found",
            );
            return false;
          }
        }

        return true;
      });

      if (!hasAny) {
        logger.debug({ request, discount }, "Discount limit to not found");
        return null;
      }
    }

    const db = await getDbConnection();
    const appointments = db.collection<AppointmentEntity>(
      APPOINTMENTS_COLLECTION_NAME,
    );

    if (discount.maxUsage) {
      const usage = await appointments.countDocuments({
        "discount.id": discount._id,
      });

      if (usage >= discount.maxUsage) {
        logger.debug({ request, discount }, "Discount max usage reached");
        return null;
      }
    }

    if (discount.maxUsagePerCustomer && request.customerId) {
      const usage = await appointments.countDocuments({
        "discount.id": discount._id,
        customerId: request.customerId,
      });

      if (usage >= discount.maxUsagePerCustomer) {
        logger.debug(
          { request, discount },
          "Discount max usage per customer reached",
        );
        return null;
      }
    }

    logger.debug({ request, discount }, "Discount applied");
    return discount;
  }

  public async hasActiveDiscounts(date: Date): Promise<boolean> {
    const logger = this.loggerFactory("hasActiveDiscounts");
    logger.debug({ date }, "Checking for active discounts");
    const db = await getDbConnection();
    const discounts = db.collection<Discount>(DISCOUNTS_COLLECTION_NAME);

    const { timeZone } =
      await this.configurationService.getConfiguration("general");

    const dt = DateTime.fromJSDate(date).setZone(timeZone).toJSDate();

    const hasNext = await discounts
      .aggregate([
        {
          $match: {
            $and: [
              {
                enabled: true,
              },
              {
                $or: [
                  {
                    startDate: { $lt: dt },
                  },
                  {
                    startDate: { $exists: false },
                  },
                ],
              },
              {
                $or: [
                  {
                    endDate: { $gt: dt },
                  },
                  {
                    endDate: { $exists: false },
                  },
                ],
              },
            ],
          },
        },
      ])
      .hasNext();

    logger.debug({ date, hasNext }, "Active discounts check result");
    return hasNext;
  }
}
