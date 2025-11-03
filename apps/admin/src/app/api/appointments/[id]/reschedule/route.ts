import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  dateTime: z.coerce.date<Date>(),
  duration: z.coerce.number<number>().int().min(1),
  doNotNotifyCustomer: z.coerce.boolean<boolean>().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/appointments/[id]/reschedule">,
) {
  const logger = getLoggerFactory("AdminAPI/appointments/[id]/reschedule")(
    "PATCH",
  );
  const servicesContainer = await getServicesContainer();
  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      id,
    },
    "Processing appointment reschedule API request",
  );

  const body = await request.json();
  const { data, success, error } = schema.safeParse(body);

  if (!success) {
    logger.warn({ error }, "Invalid request format");
    return NextResponse.json(
      { success: false, error, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  await servicesContainer.eventsService.rescheduleAppointment(
    id,
    data.dateTime,
    data.duration,
    data.doNotNotifyCustomer,
  );

  logger.debug(
    {
      appointmentId: id,
      dateTime: data.dateTime,
      duration: data.duration,
      doNotNotifyCustomer: data.doNotNotifyCustomer,
    },
    "Appointment rescheduled successfully",
  );

  return NextResponse.json(okStatus);
}
