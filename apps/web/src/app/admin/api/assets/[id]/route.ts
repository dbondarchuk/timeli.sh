import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { assetUpdateSchema, okStatus, UploadedFile } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/assets/[id]")("GET");
  const { id } = await params;

  logger.debug(
    {
      assetId: id,
    },
    "Getting asset by ID",
  );

  try {
    const asset = await ServicesContainer.AssetsService().getAsset(id);

    if (!asset) {
      logger.warn({ assetId: id }, "Asset not found");
      return NextResponse.json(
        {
          success: false,
          error: "Asset not found",
          code: "asset_not_found",
        },
        { status: 404 },
      );
    }

    logger.debug(
      {
        assetId: id,
        filename: asset.filename,
        mimeType: asset.mimeType,
      },
      "Successfully retrieved asset",
    );

    const { url } =
      await ServicesContainer.ConfigurationService().getConfiguration(
        "general",
      );

    const uploadedFile: UploadedFile = {
      ...asset,
      url: `${url}/assets/${asset.filename}`,
    };

    return NextResponse.json(uploadedFile);
  } catch (error: any) {
    logger.error(
      {
        assetId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to get asset",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get asset",
        code: "get_asset_failed",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/assets/[id]")("PATCH");
  const { id } = await params;
  const body = await request.json();
  const { data, error, success } = assetUpdateSchema.safeParse(body);
  if (!success) {
    logger.warn({ error }, "Invalid asset update request format");
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  logger.debug(
    {
      assetId: id,
      hasDescription: !!body.description,
    },
    "Updating asset",
  );

  try {
    await ServicesContainer.AssetsService().updateAsset(id, data);

    logger.debug(
      {
        assetId: id,
      },
      "Asset updated successfully",
    );

    return NextResponse.json(okStatus);
  } catch (error: any) {
    logger.error(
      {
        assetId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to update asset",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update asset",
        code: "update_asset_failed",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/assets/[id]")("DELETE");
  const { id } = await params;

  logger.debug(
    {
      assetId: id,
    },
    "Deleting asset",
  );

  try {
    const asset = await ServicesContainer.AssetsService().deleteAsset(id);

    if (!asset) {
      logger.warn({ assetId: id }, "Asset not found for deletion");
      return NextResponse.json(
        {
          success: false,
          error: "Asset not found",
          code: "asset_not_found",
        },
        { status: 404 },
      );
    }

    logger.debug(
      {
        assetId: id,
        filename: asset.filename,
      },
      "Asset deleted successfully",
    );

    return NextResponse.json(asset);
  } catch (error: any) {
    logger.error(
      {
        assetId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to delete asset",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete asset",
        code: "delete_asset_failed",
      },
      { status: 500 },
    );
  }
}
