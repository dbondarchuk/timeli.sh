import { bulkDeleteSchema } from "@vivid/api-sdk";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/discounts/delete")("POST");

  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing delete discounts API request",
  );

  const body = await request.json();
  const { data, success, error } = bulkDeleteSchema.safeParse(body);

  if (!success) {
    logger.warn({ error }, "Invalid delete discounts request format");
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  await ServicesContainer.ServicesService().deleteDiscounts(data.ids);
  logger.debug({ ids: data.ids }, "Discounts deleted successfully");
  return NextResponse.json(okStatus, { status: 200 });
}
