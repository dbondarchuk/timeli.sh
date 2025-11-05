import { getServicesContainer, getWebsiteUrl } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import { assetUpdateSchema, okStatus, UploadedFile } from "@timelish/types";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/assets/[id]">,
) {
  const logger = getLoggerFactory("AdminAPI/assets/[id]")("GET");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;

  logger.debug(
    {
      assetId: id,
    },
    "Getting asset by ID",
  );

  try {
    const asset = await servicesContainer.assetsService.getAsset(id);

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

    const websiteUrl = await getWebsiteUrl();

    const uploadedFile: UploadedFile = {
      ...asset,
      url: `${websiteUrl}/assets/${asset.filename}`,
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
  { params }: RouteContext<"/api/assets/[id]">,
) {
  const logger = getLoggerFactory("AdminAPI/assets/[id]")("PATCH");
  const servicesContainer = await getServicesContainer();
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
    await servicesContainer.assetsService.updateAsset(id, data);

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
  { params }: RouteContext<"/api/assets/[id]">,
) {
  const logger = getLoggerFactory("AdminAPI/assets/[id]")("DELETE");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;

  logger.debug(
    {
      assetId: id,
    },
    "Deleting asset",
  );

  try {
    const asset = await servicesContainer.assetsService.deleteAsset(id);

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
