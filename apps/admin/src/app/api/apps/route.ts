import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

export const dynamic = "force-dynamic";

const createAppSchema = z.object({
  type: z.string().min(1, "App type is required"),
});

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/apps")("GET");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing apps API request",
  );

  try {
    const apps = await servicesContainer.connectedAppsService.getApps();

    logger.debug(
      {
        count: apps.length,
      },
      "Successfully retrieved apps",
    );

    return NextResponse.json(apps);
  } catch (error: any) {
    logger.error(
      {
        error: error?.message || error?.toString(),
      },
      "Failed to get apps",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get apps",
        code: "get_apps_failed",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/apps")("POST");
  const body = await request.json();
  const servicesContainer = await getServicesContainer();

  logger.debug(
    {
      appType: body.type,
    },
    "Creating new app",
  );

  const { data, error, success } = createAppSchema.safeParse(body);
  if (!success) {
    logger.warn({ error }, "Invalid app creation request format");
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  try {
    const appId = await servicesContainer.connectedAppsService.createNewApp(
      data.type,
    );

    logger.debug(
      {
        appType: data.type,
        appId,
      },
      "New app created successfully",
    );

    return NextResponse.json(appId, { status: 201 });
  } catch (error: any) {
    logger.error(
      {
        appType: data.type,
        error: error?.message || error?.toString(),
      },
      "Failed to create app",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create app",
        code: "create_app_failed",
      },
      { status: 500 },
    );
  }
}
