import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { ConnectedAppUpdateModel, okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/apps/[id]/status">,
) {
  const logger = getLoggerFactory("AdminAPI/apps/[id]/status")("GET");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;

  logger.debug(
    {
      appId: id,
    },
    "Getting app status",
  );

  try {
    const app = await servicesContainer.connectedAppsService.getAppStatus(id);

    logger.debug(
      {
        appId: id,
        status: app?.status,
      },
      "App status retrieved",
    );

    return NextResponse.json(app);
  } catch (error: any) {
    logger.error(
      {
        appId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to get app status",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get app status",
        code: "get_app_status_failed",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/apps/[id]/status">,
) {
  const logger = getLoggerFactory("AdminAPI/apps/[id]/status")("PUT");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;
  const body = (await request.json()) as ConnectedAppUpdateModel;

  logger.debug(
    {
      appId: id,
      status: body.status,
      statusText: body.statusText,
    },
    "Setting app status",
  );

  try {
    await servicesContainer.connectedAppsService.updateApp(id, body);

    logger.debug(
      {
        appId: id,
        status: body.status,
        statusText: body.statusText,
      },
      "App status updated",
    );

    return NextResponse.json(okStatus);
  } catch (error: any) {
    logger.error(
      {
        appId: id,
        status: body.status,
        statusText: body.statusText,
        error: error?.message || error?.toString(),
      },
      "Failed to set app status",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to set app status",
        code: "set_app_status_failed",
      },
      { status: 500 },
    );
  }
}
