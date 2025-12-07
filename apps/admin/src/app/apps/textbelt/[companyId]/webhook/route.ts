import { getLoggerFactory } from "@timelish/logger";
import {
  getTextBeltConfiguration,
  ServicesContainer,
} from "@timelish/services";
import { NextRequest, NextResponse } from "next/server";
import { TextBeltWebhookService } from "./webhook.service";

export const dynamic = "force-dynamic";

const processWebhook = async (
  request: NextRequest,
  { params }: RouteContext<"/apps/textbelt/[companyId]/webhook">,
) => {
  const { companyId } = await params;
  const logger = getLoggerFactory("API/textbelt-webhook")("processWebhook");

  logger.debug(
    {
      url: request.url,
      method: request.method,
      companyId,
    },
    "Processing built-in TextBelt webhook request",
  );

  if (!companyId) {
    logger.warn("Missing required companyId parameter");
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 },
    );
  }

  const services = ServicesContainer(companyId);

  const webhookService = new TextBeltWebhookService(
    companyId,
    getTextBeltConfiguration(),
    services.configurationService,
    services.connectedAppsService,
    services.eventsService,
    services.customersService,
    services.communicationLogsService,
    services.notificationService,
    services.organizationService,
  );

  try {
    const result = await webhookService.processWebhook(request);

    if (result) {
      logger.debug(
        {
          companyId,
          status: result.status,
        },
        "Successfully processed webhook",
      );
    } else {
      logger.warn({ companyId }, "No webhook handler found");
    }

    return (
      result ?? NextResponse.json({ error: "unknown_handler" }, { status: 404 })
    );
  } catch (error: any) {
    logger.error(
      {
        companyId,
        error: error?.message || error?.toString(),
      },
      "Error processing webhook",
    );
    throw error;
  }
};

export const GET = processWebhook;
export const POST = processWebhook;
export const PUT = processWebhook;
export const DELETE = processWebhook;
