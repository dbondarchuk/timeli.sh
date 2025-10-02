"use server";

import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { AssetEntity, AssetUpdate, okStatus } from "@vivid/types";
import { notFound } from "next/navigation";

const logger = getLoggerFactory("AssetsActions");

export async function createAsset(formData: FormData) {
  const actionLogger = logger("createAsset");

  const file = formData.get("file") as File;
  const filename = formData.get("filename")?.toString() || "";
  const mimeType =
    formData.get("mimeType")?.toString() || "application/octet-stream";
  const description = formData.get("description")?.toString();

  actionLogger.debug(
    {
      filename,
      mimeType,
      hasDescription: !!description,
      fileSize: file?.size,
    },
    "Creating new asset",
  );

  const asset: Omit<AssetEntity, "_id" | "uploadedAt" | "size" | "hash"> = {
    filename,
    mimeType,
    description,
  };

  try {
    const result = await ServicesContainer.AssetsService().createAsset(
      asset,
      file,
    );

    actionLogger.debug(
      {
        assetId: result._id,
        filename,
        mimeType,
        fileSize: result.size,
      },
      "Asset created successfully",
    );

    return result;
  } catch (error) {
    actionLogger.error(
      {
        filename,
        mimeType,
        fileSize: file?.size,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to create asset",
    );
    throw error;
  }
}

export async function updateAsset(_id: string, update: AssetUpdate) {
  const actionLogger = logger("updateAsset");

  actionLogger.debug(
    {
      assetId: _id,
      hasDescription: !!update.description,
    },
    "Updating asset",
  );

  try {
    await ServicesContainer.AssetsService().updateAsset(_id, update);

    actionLogger.debug(
      {
        assetId: _id,
      },
      "Asset updated successfully",
    );

    return okStatus;
  } catch (error) {
    actionLogger.error(
      {
        assetId: _id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update asset",
    );
    throw error;
  }
}

export async function deleteAsset(_id: string) {
  const actionLogger = logger("deleteAsset");

  actionLogger.debug(
    {
      assetId: _id,
    },
    "Deleting asset",
  );

  try {
    const asset = await ServicesContainer.AssetsService().deleteAsset(_id);
    if (!asset) {
      actionLogger.warn({ assetId: _id }, "Asset not found for deletion");
      return notFound();
    }

    actionLogger.debug(
      {
        assetId: _id,
        filename: asset.filename,
      },
      "Asset deleted successfully",
    );

    return okStatus;
  } catch (error) {
    actionLogger.error(
      {
        assetId: _id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to delete asset",
    );
    throw error;
  }
}

export async function deleteSelectedAssets(ids: string[]) {
  const actionLogger = logger("deleteSelectedAssets");

  actionLogger.debug(
    {
      assetIds: ids,
      count: ids.length,
    },
    "Deleting selected assets",
  );

  try {
    await ServicesContainer.AssetsService().deleteAssets(ids);

    actionLogger.debug(
      {
        assetIds: ids,
        count: ids.length,
      },
      "Selected assets deleted successfully",
    );

    return okStatus;
  } catch (error) {
    actionLogger.error(
      {
        assetIds: ids,
        count: ids.length,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to delete selected assets",
    );
    throw error;
  }
}

export async function checkUniqueFileName(filename: string, _id?: string) {
  const actionLogger = logger("checkUniqueFileName");

  actionLogger.debug(
    {
      filename,
      excludeId: _id,
    },
    "Checking filename uniqueness",
  );

  try {
    const result = await ServicesContainer.AssetsService().checkUniqueFileName(
      filename,
      _id,
    );

    actionLogger.debug(
      {
        filename,
        excludeId: _id,
        isUnique: result,
      },
      "Filename uniqueness check completed",
    );

    return result;
  } catch (error) {
    actionLogger.error(
      {
        filename,
        excludeId: _id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to check filename uniqueness",
    );
    throw error;
  }
}
