import { getDbClient, getDbConnection } from "./database";

import {
  Asset,
  AssetEntity,
  AssetUpdate,
  IAssetsService,
  IAssetsStorage,
  IConfigurationService,
  Query,
  WithTotal,
} from "@timelish/types";
import { buildSearchQuery, escapeRegex } from "@timelish/utils";
import { createHash } from "crypto";
import { DateTime } from "luxon";
import { Filter, ObjectId, Sort } from "mongodb";
import { Readable } from "stream";
import {
  S3AssetsStorageService,
  getS3Configuration,
} from "./s3-assets-storage";
import { BaseService } from "./services/base.service";

import {
  APPOINTMENTS_COLLECTION_NAME,
  ASSETS_COLLECTION_NAME,
  CUSTOMERS_COLLECTION_NAME,
} from "./collections";

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

export class AssetsService extends BaseService implements IAssetsService {
  protected readonly storage: IAssetsStorage;

  public constructor(
    companyId: string,
    protected readonly configurationService: IConfigurationService,
  ) {
    super("AssetsService", companyId);
    this.storage = new S3AssetsStorageService(companyId, getS3Configuration());
  }

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
            companyId: this.companyId,
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

    const filter: Filter<Asset> = {
      companyId: this.companyId,
    };

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
        {
          $match: {
            companyId: this.companyId,
          },
        },
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
    const args = {
      fileName: asset.filename,
      mimeType: asset.mimeType,
      size: file.size,
      hash: undefined as string | undefined,
    };

    const logger = this.loggerFactory("createAsset");
    logger.debug({ args }, "Creating new asset");

    const db = await getDbConnection();
    const dbClient = await getDbClient();

    const session = dbClient.startSession();
    try {
      return await session.withTransaction(async () => {
        const assets = db.collection<AssetEntity>(ASSETS_COLLECTION_NAME);
        const filename = asset.filename.replace(/ /g, "_");

        const existing = await assets.findOne({
          filename,
          companyId: this.companyId,
        });

        if (!!existing) {
          logger.error(args, "Asset with such file name already exists");
          throw new Error(`File '${filename}' already exists`);
        }

        const hash = await getFileHash(file);
        args.hash = hash;
        const existingWithSameHash = await assets.findOne({
          hash,
          appointmentId: asset.appointmentId,
          customerId: asset.customerId,
          companyId: this.companyId,
        });

        if (!!existingWithSameHash) {
          logger.info(args, "Asset with such hash already exists");
          return existingWithSameHash;
        }

        logger.debug(args, "Uploading new asset");

        await this.storage.saveFile(
          filename,
          Readable.fromWeb(file.stream() as any),
          file.size,
        );

        logger.debug(args, "Saving new asset");

        const dbAsset: Asset = {
          ...asset,
          filename,
          companyId: this.companyId,
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
        companyId: this.companyId,
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

        await this.storage.deleteFile(asset.filename);
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
        const assets = db.collection<AssetEntity>(ASSETS_COLLECTION_NAME);

        const toRemove = await assets
          .find({
            _id: {
              $in: assetsIds,
            },
            companyId: this.companyId,
          })
          .toArray();

        const { deletedCount } = await assets.deleteMany({
          _id: {
            $in: assetsIds,
          },
          companyId: this.companyId,
        });

        logger.debug(
          { assetsIds, deletedCount },
          "Assets deleted. Deleting files",
        );

        await this.storage.deleteFiles(toRemove.map((asset) => asset.filename));

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
      companyId: this.companyId,
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

    const db = await getDbConnection();
    const assets = db.collection<AssetEntity>(ASSETS_COLLECTION_NAME);

    const asset = await assets.findOne({
      filename,
      companyId: this.companyId,
    });

    if (!asset) {
      logger.warn({ filename }, "Asset not found");
      return null;
    }

    logger.debug(
      { filename, assetId: asset._id, size: asset.size },
      "Found asset, streaming it.",
    );

    const stream = await this.storage.getFile(filename);
    if (!stream) {
      logger.warn({ filename }, "File not found");
      return null;
    }

    return { stream, asset };
  }

  private get aggregateJoin() {
    return [
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
    ];
  }
}
