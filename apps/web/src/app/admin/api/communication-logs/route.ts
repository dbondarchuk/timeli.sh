import { communicationLogsSearchParamsLoader } from "@vivid/api-sdk";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/communication-logs")("GET");

  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing communication logs API request",
  );

  const params = communicationLogsSearchParamsLoader(
    request.nextUrl.searchParams,
  );

  const page = params.page;
  const search = params.search ?? undefined;
  const limit = params.limit;
  const sort = params.sort;
  const customerId = params.customerId ?? undefined;
  const appointmentId = params.appointmentId ?? undefined;
  const direction = params.direction;
  const channel = params.channel;
  const start = params.start ?? undefined;
  const end = params.end ?? undefined;
  const participantType = params.participantType ?? undefined;

  const offset = (page - 1) * limit;

  logger.debug(
    {
      page,
      limit,
      offset,
    },
    "Fetching communication logs with parameters",
  );

  const res =
    await ServicesContainer.CommunicationLogsService().getCommunicationLogs({
      offset,
      limit,
      search,
      sort,
      customerId,
      appointmentId,
      direction,
      channel,
      participantType,
      range:
        start || end
          ? {
              start,
              end,
            }
          : undefined,
    });

  logger.debug(
    {
      total: res.total,
      count: res.items.length,
    },
    "Successfully retrieved communication logs",
  );

  return NextResponse.json(res);
}

export async function DELETE(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/communication-logs")("DELETE");

  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing deleting all communication logs API request",
  );

  await ServicesContainer.CommunicationLogsService().clearAllLogs();

  logger.debug("All communication logs deleted successfully");

  return NextResponse.json(okStatus, { status: 200 });
}
