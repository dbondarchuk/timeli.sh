import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getLoggerFactory } from "@vivid/logger";
import {
  ConnectedAppData,
  ConnectedAppError,
  ConnectedAppStatusWithText,
  IAssetsStorage,
  IConnectedApp,
  IConnectedAppProps,
} from "@vivid/types";
import { decrypt, encrypt, maskify } from "@vivid/utils";
import { Readable } from "stream";
import { S3Configuration } from "./models";
import {
  S3AssetsStorageAdminAllKeys,
  S3AssetsStorageAdminKeys,
  S3AssetsStorageAdminNamespace,
} from "./translations/types";

const DEFAULT_BUCKET_NAME = "assets";
const MASKED_SECRET_ACCESS_KEY = "this-is-a-masked-secret-access-key";

export default class S3AssetsStorageConnectedApp
  implements IConnectedApp<S3Configuration>, IAssetsStorage
{
  protected readonly loggerFactory = getLoggerFactory(
    "S3AssetsStorageConnectedApp",
  );

  public constructor(protected readonly props: IConnectedAppProps) {}

  public async processAppData(
    appData: S3Configuration,
  ): Promise<S3Configuration> {
    return {
      ...appData,
      secretAccessKey: appData.secretAccessKey ? MASKED_SECRET_ACCESS_KEY : "",
    };
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: S3Configuration,
  ): Promise<
    ConnectedAppStatusWithText<
      S3AssetsStorageAdminNamespace,
      S3AssetsStorageAdminKeys
    >
  > {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      {
        appId: appData._id,
        region: data.region,
        endpoint: data.endpoint,
        bucket: data.bucket || DEFAULT_BUCKET_NAME,
        accessKeyId: maskify(data.accessKeyId),
      },
      "Processing S3 configuration request",
    );

    if (
      data.secretAccessKey === MASKED_SECRET_ACCESS_KEY &&
      appData?.data?.secretAccessKey
    ) {
      data.secretAccessKey = appData.data.secretAccessKey;
    } else if (data.secretAccessKey) {
      data.secretAccessKey = encrypt(data.secretAccessKey);
    }

    try {
      const client = this.getClient(data);
      const bucket = this.getBucketName(data);

      logger.debug(
        { appId: appData._id, bucket },
        "Checking if S3 bucket exists",
      );

      try {
        const response = await client.send(
          new HeadBucketCommand({ Bucket: bucket }),
        );

        logger.debug(
          { appId: appData._id, bucket },
          "S3 bucket already exists",
        );
      } catch (error: any) {
        if (error?.name === "NotFound") {
          logger.debug(
            { appId: appData._id, bucket },
            "S3 bucket not found, creating new bucket",
          );
          await client.send(new CreateBucketCommand({ Bucket: bucket }));

          logger.debug(
            { appId: appData._id, bucket },
            "Successfully created S3 bucket",
          );
        } else {
          logger.error(
            {
              appId: appData._id,
              bucket,
              error: error?.message || error?.toString(),
            },
            "Error checking S3 bucket",
          );
          throw new ConnectedAppError(
            "app_s3-assets-storage_admin.statusText.error_checking_bucket" satisfies S3AssetsStorageAdminAllKeys,
          );
        }
      }

      const status: ConnectedAppStatusWithText<
        S3AssetsStorageAdminNamespace,
        S3AssetsStorageAdminKeys
      > = {
        status: "connected",
        statusText:
          "app_s3-assets-storage_admin.statusText.bucket_successfully_created" satisfies S3AssetsStorageAdminAllKeys,
      };

      this.props.update({
        account: {
          username: `${data.region} / ${maskify(data.accessKeyId)}`,
          serverUrl: data.endpoint,
        },
        data,
        ...status,
      });

      logger.info(
        { appId: appData._id, bucket, region: data.region },
        "Successfully connected to S3 storage",
      );

      return status;
    } catch (e: any) {
      logger.error(
        { appId: appData._id, error: e?.message || e?.toString() },
        "Error processing S3 configuration request",
      );

      const status: ConnectedAppStatusWithText<
        S3AssetsStorageAdminNamespace,
        S3AssetsStorageAdminKeys
      > = {
        status: "failed",
        statusText:
          e instanceof ConnectedAppError
            ? {
                key: e.key as S3AssetsStorageAdminAllKeys,
                args: e.args,
              }
            : ("app_s3-assets-storage_admin.statusText.error_processing_configuration" satisfies S3AssetsStorageAdminAllKeys),
      };

      this.props.update({
        ...status,
      });

      return status;
    }
  }

  public async getFile(
    appData: ConnectedAppData,
    filename: string,
  ): Promise<Readable> {
    const logger = this.loggerFactory("getFile");
    logger.debug(
      {
        appId: appData._id,
        filename,
        bucket: this.getBucketName(appData.data),
      },
      "Getting file from S3",
    );

    try {
      const client = this.getClient(appData.data);

      const response = await client.send(
        new GetObjectCommand({
          Bucket: this.getBucketName(appData.data),
          Key: filename,
        }),
      );

      if (!response.Body) {
        logger.error(
          { appId: appData._id, filename },
          "S3 response has no body",
        );
        throw new ConnectedAppError<
          S3AssetsStorageAdminNamespace,
          S3AssetsStorageAdminKeys
        >(
          "app_s3-assets-storage_admin.statusText.no_body_present" satisfies S3AssetsStorageAdminAllKeys,
        );
      }

      logger.debug(
        { appId: appData._id, filename, contentLength: response.ContentLength },
        "Successfully retrieved file from S3",
      );

      return response.Body as Readable;
    } catch (error: any) {
      if (error?.name === "NotFound") {
        logger.warn({ appId: appData._id, filename }, "File not found in S3");
        throw new ConnectedAppError<
          S3AssetsStorageAdminNamespace,
          S3AssetsStorageAdminKeys
        >(
          "app_s3-assets-storage_admin.statusText.file_not_found" satisfies S3AssetsStorageAdminAllKeys,
          { filename },
        );
      }

      logger.error(
        {
          appId: appData._id,
          filename,
          error: error?.message || error?.toString(),
        },
        "Error getting file from S3",
      );
      throw new ConnectedAppError<
        S3AssetsStorageAdminNamespace,
        S3AssetsStorageAdminKeys
      >(
        "app_s3-assets-storage_admin.statusText.error_getting_file" satisfies S3AssetsStorageAdminAllKeys,
      );
    }
  }

  public async saveFile(
    appData: ConnectedAppData,
    filename: string,
    file: Readable,
    fileLength: number,
  ): Promise<void> {
    const logger = this.loggerFactory("saveFile");
    logger.debug(
      {
        appId: appData._id,
        filename,
        fileLength,
        bucket: this.getBucketName(appData.data),
      },
      "Saving file to S3",
    );

    try {
      const client = this.getClient(appData.data);

      await client.send(
        new PutObjectCommand({
          Bucket: this.getBucketName(appData.data),
          Key: filename,
          Body: file,
          ContentLength: fileLength,
        }),
      );

      logger.info(
        { appId: appData._id, filename, fileLength },
        "Successfully saved file to S3",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          filename,
          fileLength,
          error: error?.message || error?.toString(),
        },
        "Error saving file to S3",
      );
      throw new ConnectedAppError<
        S3AssetsStorageAdminNamespace,
        S3AssetsStorageAdminKeys
      >(
        "app_s3-assets-storage_admin.statusText.error_saving_file" satisfies S3AssetsStorageAdminAllKeys,
      );
    }
  }

  public async deleteFile(
    appData: ConnectedAppData,
    filename: string,
  ): Promise<void> {
    const logger = this.loggerFactory("deleteFile");
    logger.debug(
      {
        appId: appData._id,
        filename,
        bucket: this.getBucketName(appData.data),
      },
      "Deleting file from S3",
    );

    try {
      const client = this.getClient(appData.data);

      const exists = await this.checkExists(appData.data, filename);
      if (!exists) {
        logger.debug(
          { appId: appData._id, filename },
          "File does not exist, skipping deletion",
        );
        return;
      }

      await client.send(
        new DeleteObjectCommand({
          Bucket: this.getBucketName(appData.data),
          Key: filename,
        }),
      );

      logger.info(
        { appId: appData._id, filename },
        "Successfully deleted file from S3",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          filename,
          error: error?.message || error?.toString(),
        },
        "Error deleting file from S3",
      );
      throw new ConnectedAppError<
        S3AssetsStorageAdminNamespace,
        S3AssetsStorageAdminKeys
      >(
        "app_s3-assets-storage_admin.statusText.error_deleting_file" satisfies S3AssetsStorageAdminAllKeys,
      );
    }
  }

  public async deleteFiles(
    appData: ConnectedAppData,
    filenames: string[],
  ): Promise<void> {
    const logger = this.loggerFactory("deleteFiles");
    logger.debug(
      { appId: appData._id, filenames, fileCount: filenames.length },
      "Deleting multiple files from S3",
    );

    try {
      await Promise.all(
        filenames.map((filename) => this.deleteFile(appData, filename)),
      );

      logger.info(
        { appId: appData._id, fileCount: filenames.length },
        "Successfully deleted all files from S3",
      );
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          filenames,
          error: error?.message || error?.toString(),
        },
        "Error deleting files from S3",
      );
      throw new ConnectedAppError<
        S3AssetsStorageAdminNamespace,
        S3AssetsStorageAdminKeys
      >(
        "app_s3-assets-storage_admin.statusText.error_deleting_files" satisfies S3AssetsStorageAdminAllKeys,
      );
    }
  }

  public async checkExists(
    appData: ConnectedAppData,
    filename: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkExists");
    logger.debug(
      {
        appId: appData._id,
        filename,
        bucket: this.getBucketName(appData.data),
      },
      "Checking if file exists in S3",
    );

    try {
      const client = this.getClient(appData.data);

      await client.send(
        new HeadObjectCommand({
          Bucket: this.getBucketName(appData.data),
          Key: filename,
        }),
      );

      logger.debug({ appId: appData._id, filename }, "File exists in S3");

      return true;
    } catch (error: any) {
      if (error?.name === "NotFound") {
        logger.debug(
          { appId: appData._id, filename },
          "File does not exist in S3",
        );
        return false;
      }

      logger.error(
        {
          appId: appData._id,
          filename,
          error: error?.message || error?.toString(),
        },
        "Error checking if file exists in S3",
      );

      throw new ConnectedAppError<
        S3AssetsStorageAdminNamespace,
        S3AssetsStorageAdminKeys
      >(
        "app_s3-assets-storage_admin.statusText.error_checking_file_exists" satisfies S3AssetsStorageAdminAllKeys,
      );
    }
  }

  private getClient(data: S3Configuration) {
    const logger = this.loggerFactory("getClient");

    const secretAccessKey = data?.secretAccessKey
      ? decrypt(data.secretAccessKey)
      : undefined;

    logger.debug(
      {
        region: data?.region,
        endpoint: data?.endpoint,
        accessKeyId: data?.accessKeyId ? maskify(data.accessKeyId) : undefined,
        forcePathStyle: data?.forcePathStyle,
      },
      "Creating S3 client",
    );

    if (!data || !data.region || !data.accessKeyId || !secretAccessKey) {
      logger.error(
        {
          hasRegion: !!data?.region,
          hasAccessKeyId: !!data?.accessKeyId,
          hasSecretAccessKey: !!data?.secretAccessKey,
        },
        "Invalid S3 configuration",
      );
      throw new ConnectedAppError<
        S3AssetsStorageAdminNamespace,
        S3AssetsStorageAdminKeys
      >(
        "app_s3-assets-storage_admin.statusText.error_processing_configuration" satisfies S3AssetsStorageAdminAllKeys,
      );
    }

    logger.debug(
      { region: data.region, endpoint: data.endpoint },
      "S3 client created successfully",
    );

    return new S3Client({
      region: data.region,
      credentials: {
        accessKeyId: data.accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      endpoint: data.endpoint,
      forcePathStyle: data.forcePathStyle,
    });
  }

  private getBucketName(data: S3Configuration) {
    const bucketName = data?.bucket ?? DEFAULT_BUCKET_NAME;

    const logger = this.loggerFactory("getBucketName");
    logger.debug(
      { bucketName, defaultBucket: data?.bucket ? false : true },
      "Getting S3 bucket name",
    );

    return bucketName;
  }
}
