import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { NextRequest, NextResponse } from "next/server";

export const fetchCache = "force-cache";
export const revalidate = 10;

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/templates/check")("GET");

  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing templates check API request",
  );

  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");
  const id = searchParams.get("id");

  if (!name) {
    logger.warn({ name, id }, "Missing required name parameter");
    return NextResponse.json(
      {
        error: "Name parameter is required",
        code: "missing_required_parameter",
        success: false,
      },
      { status: 400 },
    );
  }

  logger.debug({ name, id }, "Checking template name uniqueness");

  const isUnique = await ServicesContainer.TemplatesService().checkUniqueName(
    name,
    id || undefined,
  );

  logger.debug(
    {
      name,
      id,
      isUnique,
    },
    "Template name uniqueness check completed",
  );

  return NextResponse.json(
    { isUnique },
    {
      headers: new Headers({
        "Cache-Control": "max-age=10",
      }),
    },
  );
}
