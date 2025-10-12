import { getLoggerFactory } from "@vivid/logger";
import { createReadStream, existsSync } from "fs";
import fs, { mkdir } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import {
  ConnectedAppData,
  ConnectedAppError,
  IAssetsStorage,
  IConnectedApp,
  IConnectedAppProps,
} from "@vivid/types";
import { FileSystemAssetsStorageAdminAllKeys } from "./translations/types";

export default class FileSystemAssetsStorageConnectedApp
  implements IConnectedApp, IAssetsStorage
{
  protected readonly loggerFactory = getLoggerFactory(
    "FileSystemAssetsStorageConnectedApp",
  );

  public constructor(protected readonly props: IConnectedAppProps) {}

  processRequest?: any;
  // public async processRequest(): Promise<void> {
  //   // do nothing
  // }

  public async getFile(
    appData: ConnectedAppData,
    filename: string,
  ): Promise<Readable> {
    const logger = this.loggerFactory("getFile");
    logger.debug(
      { appId: appData._id, filename },
      "Getting file from file system storage",
    );

    try {
      const filepath = this.getFilePath(filename);

      logger.debug(
        { appId: appData._id, filename, filepath },
        "Resolved file path",
      );

      const exists = await this.checkExists(appData, filename);
      if (!exists) {
        logger.warn(
          { appId: appData._id, filename, filepath },
          "File does not exist",
        );

        throw new ConnectedAppError(
          "app_file-system-assets-storage_admin.statusText.file_not_found" satisfies FileSystemAssetsStorageAdminAllKeys,
          { filename },
        );
      }

      const stream = createReadStream(filepath);

      logger.info(
        { appId: appData._id, filename, filepath },
        "Successfully created read stream for file",
      );

      return stream;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, filename, error },
        "Error getting file from file system storage",
      );
      throw error;
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
      { appId: appData._id, filename, fileLength },
      "Saving file to file system storage",
    );

    try {
      const filepath = this.getFilePath(filename);

      logger.debug(
        { appId: appData._id, filename, filepath },
        "Resolved file path for saving",
      );

      await this.ensureDirectoryExistence(filepath);

      logger.debug(
        { appId: appData._id, filename, filepath },
        "Ensured directory exists, writing file",
      );

      await fs.writeFile(filepath, file, {});

      logger.info(
        { appId: appData._id, filename, filepath, fileLength },
        "Successfully saved file to file system storage",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, filename, fileLength, error },
        "Error saving file to file system storage",
      );

      throw new ConnectedAppError(
        "app_file-system-assets-storage_admin.statusText.error_saving_file" satisfies FileSystemAssetsStorageAdminAllKeys,
        { filename },
      );
    }
  }

  public async deleteFile(
    appData: ConnectedAppData,
    filename: string,
  ): Promise<void> {
    const logger = this.loggerFactory("deleteFile");
    logger.debug(
      { appId: appData._id, filename },
      "Deleting file from file system storage",
    );

    try {
      const filepath = this.getFilePath(filename);

      logger.debug(
        { appId: appData._id, filename, filepath },
        "Resolved file path for deletion",
      );

      if (!existsSync(filepath)) {
        logger.warn(
          { appId: appData._id, filename, filepath },
          "File does not exist, skipping deletion",
        );
        return;
      }

      await fs.rm(filepath);

      logger.info(
        { appId: appData._id, filename, filepath },
        "Successfully deleted file from file system storage",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, filename, error },
        "Error deleting file from file system storage",
      );

      throw new ConnectedAppError(
        "app_file-system-assets-storage_admin.statusText.error_deleting_file" satisfies FileSystemAssetsStorageAdminAllKeys,
        { filename },
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
      "Deleting multiple files from file system storage",
    );

    try {
      let deletedCount = 0;
      let skippedCount = 0;

      for (const filename of filenames) {
        const filepath = this.getFilePath(filename);

        logger.debug(
          { appId: appData._id, filename, filepath },
          "Processing file for deletion",
        );

        if (!existsSync(filepath)) {
          logger.warn(
            { appId: appData._id, filename, filepath },
            "File does not exist, skipping deletion",
          );
          skippedCount++;
          continue;
        }

        await fs.rm(filepath);
        deletedCount++;

        logger.debug(
          { appId: appData._id, filename, filepath },
          "Successfully deleted individual file",
        );
      }

      logger.info(
        {
          appId: appData._id,
          totalFiles: filenames.length,
          deletedCount,
          skippedCount,
        },
        "Completed bulk file deletion from file system storage",
      );
    } catch (error: any) {
      logger.error(
        { appId: appData._id, filenames, error },
        "Error deleting files from file system storage",
      );

      throw new ConnectedAppError(
        "app_file-system-assets-storage_admin.statusText.error_deleting_file" satisfies FileSystemAssetsStorageAdminAllKeys,
        { filename: filenames.join(", ") },
      );
    }
  }

  public async checkExists(
    appData: ConnectedAppData,
    filename: string,
  ): Promise<boolean> {
    const logger = this.loggerFactory("checkExists");
    logger.debug(
      { appId: appData._id, filename },
      "Checking if file exists in file system storage",
    );

    try {
      const filepath = this.getFilePath(filename);
      const exists = existsSync(filepath);

      logger.debug(
        { appId: appData._id, filename, filepath, exists },
        "File existence check completed",
      );

      return exists;
    } catch (error: any) {
      logger.error(
        { appId: appData._id, filename, error },
        "Error checking file existence",
      );
      throw error;
    }
  }

  private getFilePath(filename: string) {
    const logger = this.loggerFactory("getFilePath");
    const filepath = path.join(process.cwd(), "public", "upload", filename);

    logger.debug({ filename, filepath }, "Generated file path");

    return filepath;
  }

  private async ensureDirectoryExistence(filePath: string) {
    const logger = this.loggerFactory("ensureDirectoryExistence");
    logger.debug({ filePath }, "Ensuring directory exists");

    try {
      const dirname = path.dirname(filePath);

      if (existsSync(dirname)) {
        logger.debug({ dirname }, "Directory already exists");
        return true;
      }

      logger.debug({ dirname }, "Creating directory recursively");

      await mkdir(dirname, { recursive: true });

      logger.debug({ dirname }, "Successfully created directory");

      return true;
    } catch (error: any) {
      logger.error({ filePath, error }, "Error ensuring directory existence");
      throw error;
    }
  }
}
