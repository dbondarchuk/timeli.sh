import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/apps/[id]")("GET");
  const { id } = await params;

  logger.debug(
    {
      appId: id,
    },
    "Getting app by ID",
  );

  try {
    const app = await ServicesContainer.ConnectedAppsService().getApp(id);

    logger.debug(
      {
        appId: id,
        appName: app.name,
      },
      "Successfully retrieved app",
    );

    return NextResponse.json(app);
  } catch (error: any) {
    logger.error(
      {
        appId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to get app",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get app",
        code: "get_app_failed",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/apps/[id]")("DELETE");
  const { id } = await params;

  logger.debug(
    {
      appId: id,
    },
    "Deleting app",
  );

  try {
    await ServicesContainer.ConnectedAppsService().deleteApp(id);

    logger.debug(
      {
        appId: id,
      },
      "App deleted successfully",
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error(
      {
        appId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to delete app",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete app",
        code: "delete_app_failed",
      },
      { status: 500 },
    );
  }
}
