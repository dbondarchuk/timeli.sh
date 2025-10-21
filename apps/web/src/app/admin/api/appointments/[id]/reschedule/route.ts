import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  dateTime: z.coerce.date(),
  duration: z.coerce.number().int().min(1),
  doNotNotifyCustomer: z.coerce.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/appointments/[id]/reschedule")(
    "PATCH",
  );
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

  await ServicesContainer.EventsService().rescheduleAppointment(
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
