import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { appointmentStatuses, okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const schema = z.object({
  status: z.enum(appointmentStatuses).exclude(["pending"]),
  by: z.enum(["customer", "user"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/appointments/[id]/status">,
) {
  const logger = getLoggerFactory("AdminAPI/appointments/[id]/status")("PATCH");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      id,
    },
    "Processing appointment status update API request",
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

  await servicesContainer.eventsService.changeAppointmentStatus(
    id,
    data.status,
    data.by,
  );

  logger.debug(
    {
      appointmentId: id,
      newStatus: data.status,
      by: data.by,
    },
    "Appointment status changed successfully",
  );

  return NextResponse.json(okStatus);
}
