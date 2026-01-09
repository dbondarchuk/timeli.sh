import { trackBookingStep } from "@/utils/booking-tracking";
import { getServicesContainer } from "@/utils/utils";
import { getLoggerFactory } from "@timelish/logger";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("API/booking/options")("GET");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing booking options API request",
  );

  // Track booking started
  await trackBookingStep(request, "OPTIONS_REQUESTED");

  const response =
    await servicesContainer.eventsService.getAppointmentOptions();

  logger.debug(
    {
      optionsCount: response.options.length,
      showPromoCode: response.showPromoCode,
    },
    "Successfully retrieved booking options",
  );

  return NextResponse.json(response);
}
