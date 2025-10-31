import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { AppointmentStatus, appointmentStatuses } from "@vivid/types";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/events")("GET");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing events API request",
  );

  const searchParams = request.nextUrl.searchParams;
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");
  const includeDeclined =
    searchParams.get("includeDeclined")?.toLowerCase() === "true";

  if (!startStr || !endStr) {
    logger.warn({ startStr, endStr }, "Missing required date range parameters");
    return NextResponse.json({ error: "Range is required" }, { status: 400 });
  }

  const start = DateTime.fromISO(startStr);
  const end = DateTime.fromISO(endStr);
  if (!start.isValid || !end.isValid) {
    logger.warn(
      { startStr, endStr, startValid: start.isValid, endValid: end.isValid },
      "Invalid date format provided",
    );
    return NextResponse.json(
      { error: "Start and End must be dates in ISO format" },
      { status: 400 },
    );
  }

  const statuses: AppointmentStatus[] = appointmentStatuses.filter(
    (s) => includeDeclined || s !== "declined",
  );

  logger.debug(
    {
      start: start.toISO(),
      end: end.toISO(),
      includeDeclined,
      statuses,
    },
    "Fetching events with parameters",
  );

  let events = await servicesContainer.eventsService.getEvents(
    start.toJSDate(),
    end.toJSDate(),
    statuses,
  );

  logger.debug(
    {
      start: start.toISO(),
      end: end.toISO(),
      eventCount: events.length,
    },
    "Successfully retrieved events",
  );

  // const config =
  //   await ServicesContainer.ConfigurationService().getConfiguration("booking");

  // events = events.map((event) => ({
  //   ...event,
  //   dateTime: DateTime.fromJSDate(event.dateTime)
  //     .setZone(config.timezone)
  //     .toJSDate(),
  //   createdAt:
  //     "createdAt" in event
  //       ? DateTime.fromJSDate(event.createdAt)
  //           .setZone(config.timezone)
  //           .toJSDate()
  //       : undefined,
  // }));

  return NextResponse.json(events);
}
