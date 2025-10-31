import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { AppScope } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/apps/by/scope")("GET");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing apps by scope API request",
  );

  const scopeParams = request.nextUrl.searchParams.getAll("scope");

  if (scopeParams.length === 0) {
    logger.warn({ scopeParams }, "Missing required scope parameters");
    return NextResponse.json(
      {
        success: false,
        error: "At least one scope is required",
        code: "missing_scope_parameter",
      },
      { status: 400 },
    );
  }

  logger.debug(
    {
      scope: scopeParams,
    },
    "Getting apps by scope",
  );

  try {
    const apps = await servicesContainer.connectedAppsService.getAppsByScope(
      ...(scopeParams as AppScope[]),
    );

    logger.debug(
      {
        scope: scopeParams,
        count: apps.length,
      },
      "Apps by scope retrieved",
    );

    return NextResponse.json(apps);
  } catch (error: any) {
    logger.error(
      {
        scope: scopeParams,
        error: error?.message || error?.toString(),
      },
      "Failed to get apps by scope",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get apps by scope",
        code: "get_apps_by_scope_failed",
      },
      { status: 500 },
    );
  }
}
