import { getServicesContainer } from "@/utils/utils";
import { availabilitySearchParamsLoader } from "@vivid/api-sdk";
import { getLoggerFactory } from "@vivid/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("API/availability")("GET");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing availability API request",
  );

  const params = availabilitySearchParamsLoader(request.nextUrl.searchParams);
  const duration = params.duration;

  if (!duration || duration <= 0) {
    logger.warn({ duration }, "Invalid duration parameter");
    return NextResponse.json(
      {
        error: "Duration should be positive number",
        code: "invalid_duration",
        success: false,
      },
      { status: 400 },
    );
  }

  logger.debug({ duration }, "Fetching availability");

  const availability =
    await servicesContainer.eventsService.getAvailability(duration);

  logger.debug(
    {
      duration,
      availableSlots: availability.length,
    },
    "Successfully retrieved availability",
  );

  return NextResponse.json(availability);
}
