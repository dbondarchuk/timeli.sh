import { getServicesContainer } from "@/app/utils";
import { bulkDeleteSchema } from "@vivid/api-sdk";
import { getLoggerFactory } from "@vivid/logger";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/pages/footers/delete")("POST");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing page footers bulk delete request",
  );

  const body = await request.json();

  const { data, error, success } = bulkDeleteSchema.safeParse(body);
  if (!success) {
    logger.warn({ error }, "Invalid bulk delete request format");
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  logger.debug(
    {
      ids: data.ids,
    },
    "Deleting page footers",
  );

  try {
    await servicesContainer.pagesService.deletePageFooters(data.ids);

    logger.debug(
      {
        ids: data.ids,
      },
      "Page footers deleted successfully",
    );

    return NextResponse.json(okStatus);
  } catch (error: any) {
    logger.error(
      {
        ids: data.ids,
        error: error?.message || error?.toString(),
      },
      "Failed to delete page footers",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete page footers",
        code: "delete_page_footers_failed",
      },
      { status: 500 },
    );
  }
}
