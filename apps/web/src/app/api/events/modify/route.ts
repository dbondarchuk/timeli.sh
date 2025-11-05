import { getModifyAppointmentInformationRequestResult } from "@/utils/appointments/get-modify-appointment-request";
import { getLoggerFactory } from "@timelish/logger";
import { modifyAppointmentInformationRequestSchema } from "@timelish/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("API/event/modify")("POST");

  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing fetching appointment information for modify appointment API request",
  );

  const json = await request.json();

  const {
    data: modifyAppointmentInformationRequest,
    success: parseSuccess,
    error: parseError,
  } = modifyAppointmentInformationRequestSchema.safeParse(json);

  if (!parseSuccess) {
    logger.warn({ parseError }, "Invalid request format");
    return NextResponse.json(parseError, { status: 400 });
  }

  logger.debug(
    {
      type: modifyAppointmentInformationRequest.type,
      fieldsType: modifyAppointmentInformationRequest.fields.type,
    },
    "Processing appointment cancel or reschedule information request",
  );

  const eventOrError = await getModifyAppointmentInformationRequestResult(
    modifyAppointmentInformationRequest,
  );

  if ("error" in eventOrError) {
    logger.warn(
      {
        error: eventOrError.error.code,
        message: eventOrError.error.message,
        status: eventOrError.error.status,
      },
      "Appointment cancel or reschedule information request failed",
    );
    return NextResponse.json(
      {
        success: false,
        error: eventOrError.error.code,
        message: eventOrError.error.message,
      },
      { status: eventOrError.error.status },
    );
  }

  const { information } = eventOrError;

  logger.debug(
    {
      allowed: information.allowed,
      reason: !information.allowed ? information.reason : undefined,
      appointmentId: information.allowed ? information.id : undefined,
    },
    "Appointment cancel or reschedule information request successful",
  );

  return NextResponse.json(information);
}
