import { getDbClient, getDbConnection } from "./database";

import {
  Asset,
  AssetEntity,
  AssetUpdate,
  IAssetsService,
  IAssetsStorage,
  IConfigurationService,
  IConnectedAppsService,
  Query,
  WithTotal,
} from "@vivid/types";
import { buildSearchQuery, escapeRegex } from "@vivid/utils";

import { getLoggerFactory } from "@vivid/logger";
import { createHash } from "crypto";
import { DateTime } from "luxon";
import { Filter, ObjectId, Sort } from "mongodb";
import { Readable } from "stream";
import { CUSTOMERS_COLLECTION_NAME } from "./customers.service";
import { APPOINTMENTS_COLLECTION_NAME } from "./events.service";

export const ASSETS_COLLECTION_NAME = "assets";
async function getFileHash(file: File): Promise<string> {
  const hash = createHash("sha256");

  // Convert the file.stream() (Web ReadableStream) into a Node stream
  const nodeStream = Readable.fromWeb(file.stream() as any);

  return new Promise<string>((resolve, reject) => {
    nodeStream.on("data", (chunk) => hash.update(chunk));
    nodeStream.on("end", () => resolve(hash.digest("hex")));
    nodeStream.on("error", reject);
  });
}

export class AssetsService implements IAssetsService {
  protected readonly loggerFactory = getLoggerFactory("AssetsService");

  constructor(
    protected readonly configurationService: IConfigurationService,
    protected readonly connectedAppService: IConnectedAppsService,
  ) {}

  public async getAsset(id: string): Promise<Asset | null> {
    const logger = this.loggerFactory("getAsset");
    logger.debug({ assetId: id }, "Getting asset by id");

    const db = await getDbConnection();
    const assets = db.collection<AssetEntity>(ASSETS_COLLECTION_NAME);

    const asset = (await assets
      .aggregate([
        {
          $match: {
            _id: id,
          },
        },
        ...this.aggregateJoin,
      ])
      .next()) as Asset | null;

    if (!asset) {
      logger.warn({ assetId: id }, "Asset not found");
    } else {
      logger.debug(
        {
          assetId: id,
          fileName: asset.filename,
          fileSize: asset.size,
          fileType: asset.mimeType,
        },
        "Asset found",
      );
    }

    return asset;
  }

  public async getAssets(
    query: Query & {
      accept?: string[];
      customerId?: string | string[];
      appointmentId?: string | string[];
      appId?: string;
    },
  ): Promise<WithTotal<Asset>> {
    const logger = this.loggerFactory("getAssets");
    logger.debug({ query }, "Getting assets with query");

    const db = await getDbConnection();

    const sort: Sort = query.sort?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.desc ? -1 : 1,
      }),
      {},
    ) || { uploadedAt: -1 };

    const filter: Filter<Asset> = {};

    if (query.search) {
      const $regex = new RegExp(escapeRegex(query.search), "i");
      const queries = buildSearchQuery<Asset>(
        { $regex },
        "filename",
        "mimeType",
        "description",
      );

      filter.$or = queries;
    }

    if (query.accept?.length) {
      filter.$and = [
        {
          $or: query.accept
            .filter((accept) => !!accept)
            .map((accept) => ({
              mimeType: {
                $regex: `^${accept.replaceAll("*", ".*")}$`,
              },
            })),
        },
      ];
    }

    if (query.customerId) {
      filter["customer._id"] = {
        $in: Array.isArray(query.customerId)
          ? query.customerId
          : [query.customerId],
      };
    }

    if (query.appointmentId) {
      filter.appointmentId = {
        $in: Array.isArray(query.appointmentId)
          ? query.appointmentId
          : [query.appointmentId],
      };
    }

    const [res] = await db
      .collection<AssetEntity>(ASSETS_COLLECTION_NAME)
      .aggregate([
        ...this.aggregateJoin,
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

    const result = {
      total: res.totalCount?.[0]?.count || 0,
      items: res.paginatedResults || [],
    };

    logger.debug(
      {
        query,
        total: result.total,
        count: result.items.length,
      },
      "Successfully retrieved assets",
    );

    return result;
  }

  public async createAsset(
    asset: Omit<Asset, "_id" | "uploadedAt" | "size" | "hash">,
    file: File,
  ): Promise<AssetEntity> {
    const storage = await this.getAssetsStorage();
    const args = {
      fileName: asset.filename,
      mimeType: asset.mimeType,
      size: file.size,
      hash: undefined as string | undefined,
    };

    const logger = this.loggerFactory("createAsset");
    logger.debug(args, "Creating new asset");

    const db = await getDbConnection();
    const dbClient = await getDbClient();

    const session = dbClient.startSession();
    try {
      return await session.withTransaction(async () => {
        const assets = db.collection<AssetEntity>(ASSETS_COLLECTION_NAME);

        const existing = await assets.findOne({
          filename: asset.filename,
        });

        if (!!existing) {
          logger.error(args, "Asset with such file name already exists");
          throw new Error(`File '${asset.filename}' already exists`);
        }

        const hash = await getFileHash(file);
        args.hash = hash;
        const existingWithSameHash = await assets.findOne({
          hash,
          appointmentId: asset.appointmentId,
          customerId: asset.customerId,
        });

        if (!!existingWithSameHash) {
          logger.info(args, "Asset with such hash already exists");
          return existingWithSameHash;
        }

        logger.debug(args, "Uploading new asset");

        await storage.service.saveFile(
          storage.app,
          asset.filename,
          Readable.fromWeb(file.stream() as any),
          file.size,
        );

        logger.debug(args, "Saving new asset");

        const dbAsset: Asset = {
          ...asset,
          _id: new ObjectId().toString(),
          uploadedAt: DateTime.utc().toJSDate(),
          size: file.size,
          hash,
        };

        await assets.insertOne(dbAsset);

        logger.debug(args, "Asset successfully created");

        return dbAsset;
      });
    } finally {
      await session.endSession();
    }
  }

  public async updateAsset(
    assetId: string,
    update: AssetUpdate,
  ): Promise<void> {
    const logger = this.loggerFactory("updateAsset");
    logger.debug({ assetId }, "Updating asset");

    const db = await getDbConnection();
    const assets = db.collection<AssetEntity>(ASSETS_COLLECTION_NAME);

    const { _id, filename, uploadedAt, mimeType, ...updateObj } =
      update as Asset; // Remove fields in case it slips here

    await assets.updateOne(
      {
        _id: assetId,
      },
      {
        $set: updateObj,
      },
    );

    logger.debug({ assetId }, "Asset was successfully updated");
  }

  public async deleteAsset(assetId: string): Promise<Asset | null> {
    const logger = this.loggerFactory("deleteAsset");
    logger.debug({ assetId }, "Deleting asset");

    const db = await getDbConnection();
    const dbClient = await getDbClient();

    const session = dbClient.startSession();
    try {
      return await session.withTransaction(async () => {
        const storage = await this.getAssetsStorage();

        const assets = db.collection<Asset>(ASSETS_COLLECTION_NAME);

        const asset = await assets.findOneAndDelete({ _id: assetId });
        if (!asset) {
          logger.warn({ assetId }, "Asset not found");
          return null;
        }

        logger.debug(
          { assetId, fileName: asset.filename },
          "Asset deleted. Deleting file",
        );

        await storage.service.deleteFile(storage.app, asset.filename);
        logger.debug({ assetId, fileName: asset.filename }, "File deleted");

        return asset;
      });
    } finally {
      await session.endSession();
    }
  }

  public async deleteAssets(assetsIds: string[]): Promise<Asset[]> {
    const logger = this.loggerFactory("deleteAssets");
    logger.debug({ assetsIds }, "Deleting assets");

    const db = await getDbConnection();
    const dbClient = await getDbClient();

    const session = dbClient.startSession();
    try {
      return await session.withTransaction(async () => {
        const storage = await this.getAssetsStorage();
        const assets = db.collection<AssetEntity>(ASSETS_COLLECTION_NAME);

        const toRemove = await assets
          .find({
            _id: {
              $in: assetsIds,
            },
          })
          .toArray();

        const { deletedCount } = await assets.deleteMany({
          _id: {
            $in: assetsIds,
          },
        });

        logger.debug(
          { assetsIds, deletedCount },
          "Assets deleted. Deleting files",
        );

        await storage.service.deleteFiles(
          storage.app,
          toRemove.map((asset) => asset.filename),
        );

        logger.debug({ assetsIds, deletedCount }, "Files deleted");

        return toRemove;
      });
    } finally {
      await session.endSession();
    }
  }

  public async checkUniqueFileName(
    filename: string,
    _id?: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkUniqueFileName");
    logger.debug({ filename, _id }, "Checking if file name is unqiue");

    const db = await getDbConnection();
    const assets = db.collection<AssetEntity>(ASSETS_COLLECTION_NAME);

    const filter: Filter<AssetEntity> = {
      filename,
    };

    if (_id) {
      filter._id = {
        $ne: _id,
      };
    }

    const hasNext = await assets
      .aggregate([
        {
          $match: filter,
        },
      ])
      .hasNext();

    logger.debug(
      { filename, _id },
      `File name is${hasNext ? " not" : ""} unqiue`,
    );

    return !hasNext;
  }

  public async streamAsset(
    filename: string,
  ): Promise<{ stream: Readable; asset: AssetEntity } | null> {
    const logger = this.loggerFactory("streamAsset");
    logger.info({ filename }, "Streaming asset");
    const storage = await this.getAssetsStorage();

    const db = await getDbConnection();
    const assets = db.collection<AssetEntity>(ASSETS_COLLECTION_NAME);

    const asset = await assets.findOne({
      filename,
    });

    if (!asset) {
      logger.warn({ filename }, "Asset not found");
      return null;
    }

    logger.debug(
      { filename, assetId: asset._id, size: asset.size },
      "Found asset, streaming it.",
    );

    const stream = await storage.service.getFile(storage.app, filename);
    return { stream, asset };
  }

  private async getAssetsStorage() {
    const defaultAppsConfiguration =
      await this.configurationService.getConfiguration("defaultApps");

    const assetsStorageAppId = defaultAppsConfiguration?.assetsStorage.appId;

    return await this.connectedAppService.getAppService<IAssetsStorage>(
      assetsStorageAppId,
    );
  }

  private get aggregateJoin() {
    return [
      {
        $lookup: {
          from: APPOINTMENTS_COLLECTION_NAME,
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      {
        $lookup: {
          from: CUSTOMERS_COLLECTION_NAME,
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
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
    ];
  }
}
