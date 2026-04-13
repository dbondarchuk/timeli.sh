import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/communication-logs/[id]">,
) {
  const logger = getLoggerFactory("AdminAPI/communication-logs/[id]")("GET");
  const { id } = await params;
  const servicesContainer = await getServicesContainer();

  logger.debug({ logId: id }, "Fetching communication log payload");

  const content =
    await servicesContainer.communicationLogsService.getCommunicationLogContent(
      id,
    );

  if (!content) {
    logger.warn({ logId: id }, "Communication log payload not found");
    return NextResponse.json(
      { success: false, error: "communication_log_not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json(content);
}
