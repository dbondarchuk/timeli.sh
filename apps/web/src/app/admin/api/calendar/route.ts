import { calendarSearchParamsLoader } from "@vivid/api-sdk";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { AppointmentStatus, appointmentStatuses } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/calendar")("GET");

  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing calendar API request",
  );

  const searchParams = calendarSearchParamsLoader(request.nextUrl.searchParams);
  const { start, end, includeDeclined } = searchParams;
  if (!start || !end) {
    logger.warn("Missing required date range parameters");
    return NextResponse.json(
      { error: "Start and end dates are required" },
      { status: 400 },
    );
  }

  logger.debug(
    {
      start,
      end,
      includeDeclined,
    },
    "Fetching calendar data",
  );

  const statuses: AppointmentStatus[] = appointmentStatuses.filter(
    (s) => includeDeclined || s !== "declined",
  );

  const [events, schedule] = await Promise.all([
    ServicesContainer.EventsService().getEvents(start, end, statuses),
    ServicesContainer.ScheduleService().getSchedule(start, end),
  ]);

  logger.debug(
    {
      start,
      end,
      includeDeclined,
    },
    "Successfully retrieved calendar data",
  );

  return NextResponse.json({
    events,
    schedule,
  });
}
