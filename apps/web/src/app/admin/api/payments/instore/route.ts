import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import {
  inStorePaymentUpdateModelSchema,
  PaymentUpdateModel,
} from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = inStorePaymentUpdateModelSchema.extend({
  appointmentId: z.string().min(1, "payments.appointmentId.required"),
});

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/payments/instore")("POST");

  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing add instore payments API request",
  );

  const body = await request.json();

  const { data: payment, success, error } = schema.safeParse(body);

  if (!success) {
    logger.warn("Invalid request format");
    return NextResponse.json(
      { success: false, error, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  const appointment = await ServicesContainer.EventsService().getAppointment(
    payment.appointmentId,
  );

  if (!appointment) {
    logger.error(
      { appointmentId: payment.appointmentId, payment },
      "Appointment not found",
    );

    return NextResponse.json(
      {
        success: false,
        error: "Appointment not found",
        code: "appointment_not_found",
      },
      { status: 404 },
    );
  }

  const paymentUpdateModel: PaymentUpdateModel = {
    ...payment,
    customerId: appointment.customerId,
    status: "paid",
  };

  const result =
    await ServicesContainer.PaymentsService().createPayment(paymentUpdateModel);

  logger.debug(
    { appointmentId: payment.appointmentId, payment },
    "In-store appointment payment added successfully",
  );

  return NextResponse.json(result, { status: 201 });
}
