import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/apps/[id]/login-url")("GET");
  const { id } = await params;

  logger.debug(
    {
      appId: id,
    },
    "Requesting app login URL",
  );

  try {
    const loginUrl =
      await ServicesContainer.ConnectedAppsService().requestLoginUrl(id);

    logger.debug(
      {
        appId: id,
        hasUrl: !!loginUrl,
      },
      "App login URL retrieved",
    );

    return NextResponse.json(loginUrl);
  } catch (error: any) {
    logger.error(
      {
        appId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to get app login URL",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get app login URL",
        code: "get_app_login_url_failed",
      },
      { status: 500 },
    );
  }
}
