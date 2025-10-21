import { bulkDeleteSchema } from "@vivid/api-sdk";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/communication-logs/delete")(
    "DELETE",
  );

  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing deleting selected communication logs API request",
  );

  const body = await request.json();
  const { data, error, success } = bulkDeleteSchema.safeParse(body);

  if (!success) {
    logger.error("Invalid request body", { error });
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  const ids = data.ids;

  logger.debug({ ids }, "Deleting selected communication logs");

  await ServicesContainer.CommunicationLogsService().clearSelectedLogs(ids);

  logger.debug({ ids }, "Selected communication logs deleted successfully");
  return NextResponse.json(okStatus, { status: 200 });
}
