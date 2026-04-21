import { getServicesContainer, getSession } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import { appointmentStatuses, okStatus } from "@timelish/types";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const schema = z.object({
  status: z.enum(appointmentStatuses).exclude(["pending"]),
  /** When true, attributes the change to the customer (e.g. cancel link). Otherwise the signed-in admin user. */
  requestedByCustomer: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/appointments/[id]/status">,
) {
  const logger = getLoggerFactory("AdminAPI/appointments/[id]/status")("PATCH");
  const servicesContainer = await getServicesContainer();
  const session = await getSession();
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

  const actor = data.requestedByCustomer
    ? ({ type: "customer" } as const)
    : ({ type: "user", userId: session.user.id } as const);

  await servicesContainer.bookingService.changeAppointmentStatus(
    id,
    data.status,
    actor,
  );

  logger.debug(
    {
      appointmentId: id,
      newStatus: data.status,
      requestedByCustomer: data.requestedByCustomer ?? false,
    },
    "Appointment status changed successfully",
  );

  return NextResponse.json(okStatus);
}
