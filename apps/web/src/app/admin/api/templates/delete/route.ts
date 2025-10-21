import { bulkDeleteSchema } from "@vivid/api-sdk";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/templates/delete")("POST");

  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing delete templates API request",
  );

  const body = await request.json();
  const { data, success, error } = bulkDeleteSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(
      { error: error.message, code: "invalid_request", success: false },
      { status: 400 },
    );
  }

  await ServicesContainer.TemplatesService().deleteTemplates(data.ids);
  logger.debug("Templates deleted successfully", {
    ids: data.ids,
  });

  return NextResponse.json(okStatus);
}
