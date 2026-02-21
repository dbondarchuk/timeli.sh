import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import { ConnectedAppRequestError } from "@timelish/types";
import { parseJSON } from "@timelish/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/apps/[id]/process">,
) {
  const logger = getLoggerFactory("AdminAPI/apps/[id]/process")("POST");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;

  const body = parseJSON((await request.text()) ?? "");

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

    if (error instanceof ConnectedAppRequestError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          data: error.data,
        },
        { status: error.status },
      );
    }

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
