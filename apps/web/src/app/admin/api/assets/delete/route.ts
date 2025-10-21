import { bulkDeleteSchema } from "@vivid/api-sdk";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/assets/delete")("POST");
  const body = await request.json();

  logger.debug(
    {
      assetIds: body.ids,
      count: body.ids?.length || 0,
    },
    "Processing bulk delete assets request",
  );

  const { data, error, success } = bulkDeleteSchema.safeParse(body);
  if (!success) {
    logger.warn({ error }, "Invalid bulk delete request format");
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  try {
    await ServicesContainer.AssetsService().deleteAssets(data.ids);

    logger.debug(
      {
        assetIds: data.ids,
        count: data.ids.length,
      },
      "Assets deleted successfully",
    );

    return NextResponse.json(okStatus);
  } catch (error: any) {
    logger.error(
      {
        assetIds: data.ids,
        count: data.ids.length,
        error: error?.message || error?.toString(),
      },
      "Failed to delete assets",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete assets",
        code: "delete_assets_failed",
      },
      { status: 500 },
    );
  }
}
