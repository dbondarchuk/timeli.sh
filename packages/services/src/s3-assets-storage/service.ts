import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import { IAssetsStorage, SaveFileOptions, SupportedFileUrlResult, FileDeliveryResult } from "@timelish/types";
import { maskify } from "@timelish/utils";
import { basename } from "path";
import { Readable } from "stream";
import { S3Configuration } from "./types";

const DEFAULT_BUCKET_NAME = "assets";

export class S3AssetsStorageService implements IAssetsStorage {
  protected readonly loggerFactory: LoggerFactory;

  public constructor(
    protected readonly organizationId: string,
    protected readonly s3Configuration: S3Configuration,
  ) {
    this.loggerFactory = getLoggerFactory(
      "S3AssetsStorageService",
      organizationId,
    );
  }

  public async getFile(
    filename: string,
  ): Promise<{ stream: Readable; contentLength: number } | null> {
    const logger = this.loggerFactory("getFile");
    logger.debug(
      {
        filename,
        bucket: this.getBucketName(),
      },
      "Getting file from S3",
    );

    const fileKey = this.getKey(filename);
    try {
      const client = this.getClient();
      const response = await client.send(
        new GetObjectCommand({
          Bucket: this.getBucketName(),
          Key: fileKey,
        }),
      );

      if (!response.Body || !response.ContentLength) {
        logger.error({ filename, fileKey }, "S3 response has no body");
        throw new Error("S3 response has no body");
      }

      logger.debug(
        { filename, fileKey, contentLength: response.ContentLength },
        "Successfully retrieved file from S3",
      );

      return {
        stream: response.Body as Readable,
        contentLength: response.ContentLength,
      };
    } catch (error: any) {
      if (error?.name === "NoSuchKey" || error?.name === "NotFound") {
        logger.error({ filename, fileKey }, "File not found in S3");
        return null;
      }

      logger.error(
        {
          filename,
          fileKey,
          error: error?.message || error?.toString(),
        },
        "Error getting file from S3",
      );

      throw new Error("Error getting file from S3");
    }
  }

  public getPublicFileUrl(
    filename: string,
    _inline?: boolean,
  ): SupportedFileUrlResult {
    const logger = this.loggerFactory("getPublicFileUrl");

    if (!this.s3Configuration.publicUrlBase) {
      logger.debug({ filename }, "Public file URLs are not configured");
      return { supported: false };
    }

    const fileKey = this.getKey(filename);

    try {
      const url = this.buildPublicUrl(fileKey);
      logger.debug({ filename, fileKey, url }, "Built public file URL");
      return { supported: true, url };
    } catch (error: any) {
      logger.error(
        { filename, fileKey, error: error?.message || error?.toString() },
        "Error building public file URL",
      );
      return { supported: true, url: null };
    }
  }

  public async getPresignedFileUrl(
    filename: string,
    inline?: boolean,
  ): Promise<SupportedFileUrlResult> {
    const logger = this.loggerFactory("getPresignedFileUrl");
    logger.debug(
      { filename, bucket: this.getBucketName() },
      "Getting pre-signed file URL from S3",
    );

    const fileKey = this.getKey(filename);
    try {
      const fileName = basename(filename);
      const client = this.getClient();
      const command = new GetObjectCommand({
        Bucket: this.getBucketName(),
        Key: fileKey,
        ResponseContentDisposition: inline
          ? "inline"
          : `attachment; filename="${fileName}"`,
      });

      const url = await getSignedUrl(client as any, command as any, {
        expiresIn: 60 * 10, // 10 minutes
      });

      logger.debug(
        { filename, fileKey, url },
        "Successfully got pre-signed file URL from S3",
      );

      return { supported: true, url };
    } catch (error: any) {
      logger.error(
        { filename, fileKey, error: error?.message || error?.toString() },
        "Error getting pre-signed file URL from S3",
      );

      return { supported: true, url: null };
    }
  }

  public async getFileDelivery(
    filename: string,
    inline?: boolean,
  ): Promise<FileDeliveryResult | null> {
    const logger = this.loggerFactory("getFileDelivery");
    logger.debug({ filename }, "Resolving file delivery");

    const urlResult = await this.getPresignedFileUrl(filename, inline);
    if (urlResult.supported) {
      if (!urlResult.url) {
        logger.warn({ filename }, "Presigned file URL could not be built");
        return null;
      }

      return { kind: "redirect", url: urlResult.url };
    }

    logger.debug({ filename }, "Presigned URLs not supported, streaming file");

    const result = await this.getFile(filename);
    if (!result) {
      return null;
    }

    return {
      kind: "stream",
      stream: result.stream,
      contentLength: result.contentLength,
    };
  }

  public async saveFile(
    filename: string,
    file: Readable,
    fileLength: number,
    options?: SaveFileOptions,
  ): Promise<void> {
    const logger = this.loggerFactory("saveFile");
    logger.debug(
      {
        filename,
        fileLength,
        bucket: this.getBucketName(),
        publicRead: options?.publicRead,
        contentType: options?.contentType,
      },
      "Saving file to S3",
    );

    const fileKey = this.getKey(filename);
    try {
      const client = this.getClient();
      const fileName = basename(filename);

      await client.send(
        new PutObjectCommand({
          Bucket: this.getBucketName(),
          Key: fileKey,
          Body: file,
          ContentLength: fileLength,
          ...(options?.contentType ? { ContentType: options.contentType } : {}),
          ...(options?.publicRead
            ? {
                ACL: "public-read",
                CacheControl: "public, max-age=31536000, immutable",
                ContentDisposition: this.getUploadContentDisposition(
                  options.contentType,
                  fileName,
                ),
              }
            : {}),
        }),
      );

      logger.info(
        { filename, fileKey, fileLength },
        "Successfully saved file to S3",
      );
    } catch (error: any) {
      logger.error(
        {
          filename,
          fileKey,
          fileLength,
          error: error?.message || error?.toString(),
        },
        "Error saving file to S3",
      );
      throw new Error("Error saving file to S3");
    }
  }

  public async deleteFile(filename: string): Promise<void> {
    const logger = this.loggerFactory("deleteFile");
    logger.debug(
      {
        filename,
        bucket: this.getBucketName(),
      },
      "Deleting file from S3",
    );

    const fileKey = this.getKey(filename);
    try {
      const exists = await this.checkExists(filename);
      if (!exists) {
        logger.debug(
          { filename, fileKey },
          "File does not exist, skipping deletion",
        );
        return;
      }

      const client = this.getClient();
      await client.send(
        new DeleteObjectCommand({
          Bucket: this.getBucketName(),
          Key: fileKey,
        }),
      );

      logger.info({ filename, fileKey }, "Successfully deleted file from S3");
    } catch (error: any) {
      logger.error(
        {
          filename,
          fileKey,
          error: error?.message || error?.toString(),
        },
        "Error deleting file from S3",
      );
      throw new Error("Error deleting file from S3");
    }
  }

  public async deleteFiles(filenames: string[]): Promise<void> {
    const logger = this.loggerFactory("deleteFiles");
    logger.debug(
      { filenames, fileCount: filenames.length },
      "Deleting multiple files from S3",
    );

    try {
      let totalDeleted = 0;
      const client = this.getClient();
      const bucket = this.getBucketName();
      for (let i = 0; i < filenames.length; i += 1000) {
        const batch = filenames.slice(i, i + 1000);
        logger.debug(
          { startIndex: i, batchCount: batch.length },
          "Deleting batch of files from S3",
        );

        await client.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
              Objects: batch.map((Key) => ({ Key })),
              Quiet: true,
            },
          }),
        );
        totalDeleted += batch.length;
      }

      logger.debug(
        { fileCount: filenames.length, totalDeleted },
        "Successfully deleted all files from S3",
      );
    } catch (error: any) {
      logger.error(
        {
          filenames,
          error: error?.message || error?.toString(),
        },
        "Error deleting files from S3",
      );
      throw new Error("Error deleting files from S3");
    }
  }

  public async checkExists(filename: string): Promise<boolean> {
    const logger = this.loggerFactory("checkExists");
    logger.debug(
      {
        filename,
        bucket: this.getBucketName(),
      },
      "Checking if file exists in S3",
    );

    const fileKey = this.getKey(filename);
    try {
      const client = this.getClient();

      await client.send(
        new HeadObjectCommand({
          Bucket: this.getBucketName(),
          Key: fileKey,
        }),
      );

      logger.debug({ filename, fileKey }, "File exists in S3");

      return true;
    } catch (error: any) {
      if (error?.name === "NoSuchKey" || error?.name === "NotFound") {
        logger.debug({ filename, fileKey }, "File does not exist in S3");
        return false;
      }

      logger.error(
        {
          filename,
          fileKey,
          errorName: error?.name,
          errorCode: error?.code,
          error: error?.message || error?.toString(),
        },
        "Error checking if file exists in S3",
      );

      throw new Error("Error checking if file exists in S3");
    }
  }

  private getClient() {
    const logger = this.loggerFactory("getClient");

    logger.debug(
      {
        region: this.s3Configuration.region,
        endpoint: this.s3Configuration.endpoint,
        accessKeyId: this.s3Configuration.accessKeyId
          ? maskify(this.s3Configuration.accessKeyId)
          : undefined,
        forcePathStyle: this.s3Configuration.forcePathStyle,
      },
      "Creating S3 client",
    );

    if (
      !this.s3Configuration // ||
      // !this.s3Configuration.region ||
      // !this.s3Configuration.accessKeyId ||
      // !this.s3Configuration.secretAccessKey
    ) {
      logger.error({}, "Invalid S3 configuration");

      throw new Error("Invalid S3 configuration");
    }

    logger.debug(
      {
        region: this.s3Configuration.region,
        endpoint: this.s3Configuration.endpoint,
      },
      "S3 client created successfully",
    );

    return new S3Client({
      region: this.s3Configuration.region,
      credentials: {
        accessKeyId: this.s3Configuration.accessKeyId,
        secretAccessKey: this.s3Configuration.secretAccessKey,
      },
      endpoint: this.s3Configuration.endpoint,
      forcePathStyle: this.s3Configuration.forcePathStyle,
    });
  }

  private getBucketName() {
    const bucketName = this.s3Configuration?.bucket ?? DEFAULT_BUCKET_NAME;

    const logger = this.loggerFactory("getBucketName");
    logger.debug(
      {
        bucketName,
        defaultBucket: this.s3Configuration?.bucket ? false : true,
      },
      "Getting S3 bucket name",
    );

    return `${bucketName}`;
  }

  private getKey(filename: string) {
    return `${this.organizationId}/${filename}`;
  }

  private buildPublicUrl(key: string): string {
    const publicUrlBase = this.s3Configuration.publicUrlBase;
    if (!publicUrlBase) {
      throw new Error("Public URL base is not configured");
    }

    return `${publicUrlBase.replace(/\/$/, "")}/${key}`;
  }

  private getUploadContentDisposition(
    contentType: string | undefined,
    fileName: string,
  ): string {
    if (this.isInlineContentType(contentType)) {
      return "inline";
    }

    return `attachment; filename="${fileName}"`;
  }

  private isInlineContentType(contentType: string | undefined): boolean {
    if (!contentType) {
      return false;
    }

    return (
      contentType.startsWith("image/") ||
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/") ||
      contentType === "application/pdf"
    );
  }
}
