import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/apps/[id]/data")("GET");
  const { id } = await params;

  logger.debug(
    {
      appId: id,
    },
    "Getting app data",
  );

  try {
    const appService =
      await ServicesContainer.ConnectedAppsService().getAppService(id);

    let appData = appService.app.data;
    if (appService.service.processAppData && appData) {
      logger.debug(
        {
          appId: id,
          appName: appData.name,
        },
        "Processing app data by service",
      );

      appData = await appService.service.processAppData(appData);
    }

    logger.debug(
      {
        appId: id,
        hasData: !!appData,
      },
      "App data retrieved",
    );

    return NextResponse.json(appData);
  } catch (error: any) {
    logger.error(
      {
        appId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to get app data",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get app data",
        code: "get_app_data_failed",
      },
      { status: 500 },
    );
  }
}
