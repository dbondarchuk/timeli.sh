import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/apps/[id]/process">,
) {
  const logger = getLoggerFactory("AdminAPI/apps/[id]/process")("POST");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;
  const body = await request.json();

  logger.debug(
    {
      appId: id,
      hasData: !!body,
    },
    "Processing app request",
  );

  try {
    const result = await servicesContainer.connectedAppsService.processRequest(
      id,
      body,
    );

    logger.debug(
      {
        appId: id,
        hasData: !!body,
      },
      "App request processed",
    );

    return NextResponse.json(result ?? null);
  } catch (error: any) {
    logger.error(
      {
        appId: id,
        hasData: !!body,
        error: error?.message || error?.toString(),
      },
      "Failed to process app request",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process app request",
        code: "process_app_request_failed",
      },
      { status: 500 },
    );
  }
}
