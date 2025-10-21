import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appName: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/apps/static/[appName]/process")(
    "POST",
  );
  const { appName } = await params;
  const body = await request.json();

  logger.debug(
    {
      appName,
      hasData: !!body,
    },
    "Processing static app request",
  );

  try {
    const result =
      await ServicesContainer.ConnectedAppsService().processStaticRequest(
        appName,
        body,
      );

    logger.debug(
      {
        appName,
        hasData: !!body,
      },
      "Static app request processed",
    );

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error(
      {
        appName,
        hasData: !!body,
        error: error?.message || error?.toString(),
      },
      "Failed to process static app request",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process static app request",
        code: "process_static_app_request_failed",
      },
      { status: 500 },
    );
  }
}
