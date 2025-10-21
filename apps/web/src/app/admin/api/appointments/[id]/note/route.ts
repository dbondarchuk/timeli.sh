import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  note: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/appointments/[id]/note")("PATCH");
  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      id,
    },
    "Processing appointment note update API request",
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

  await ServicesContainer.EventsService().updateAppointmentNote(id, data.note);

  logger.debug(
    {
      appointmentId: id,
      note: data.note,
    },
    "Appointment note updated successfully",
  );

  return NextResponse.json(okStatus);
}
