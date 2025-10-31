import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import {
  ConfigurationKey,
  configurationSchemaMap,
  okStatus,
} from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/configuration/[configuration]">,
) {
  const logger = getLoggerFactory("AdminAPI/configuration/[configuration]")(
    "GET",
  );
  const servicesContainer = await getServicesContainer();
  const { configuration: configurationKey } = await params;

  logger.debug(
    {
      configurationKey,
    },
    "Getting configuration",
  );

  const configuration =
    await servicesContainer.configurationService.getConfiguration(
      configurationKey as ConfigurationKey,
    );

  return NextResponse.json(configuration);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext<"/api/configuration/[configuration]">,
) {
  const logger = getLoggerFactory("AdminAPI/configuration/[configuration]")(
    "PUT",
  );
  const servicesContainer = await getServicesContainer();
  const { configuration: configurationKey } = await params;
  const body = await request.json();

  logger.debug({ body }, "Updating configuration");

  const configurationSchema =
    configurationSchemaMap[configurationKey as ConfigurationKey];
  if (!configurationSchema) {
    logger.warn({ configurationKey }, "Invalid configuration key");
    return NextResponse.json(
      {
        error: "Invalid configuration key",
        success: false,
        code: "invalid_configuration_key",
      },
      { status: 400 },
    );
  }

  const { data, success, error } = configurationSchema.safeParse(body);
  if (!success) {
    logger.warn({ error, configurationKey }, "Invalid configuration");
    return NextResponse.json(
      {
        error,
        success: false,
        code: "invalid_configuration",
        configurationKey,
      },
      { status: 400 },
    );
  }

  await servicesContainer.configurationService.setConfiguration(
    configurationKey as ConfigurationKey,
    data,
  );

  logger.debug({ configurationKey, data }, "Configuration updated");
  return NextResponse.json(okStatus);
}
