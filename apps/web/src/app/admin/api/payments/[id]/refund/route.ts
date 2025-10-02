import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/payment-refund")("POST");
  const { id: paymentId } = await params;

  const body = await request.json();
  const amount = body.amount;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      paymentId,
      amount,
    },
    "Processing payment refund request",
  );

  const result = await ServicesContainer.PaymentsService().refundPayment(
    paymentId,
    amount,
  );

  if (!result.success) {
    logger.warn(
      {
        paymentId,
        amount,
        error: result.error,
        status: result.status,
      },
      "Payment refund failed",
    );
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status },
    );
  }

  await ServicesContainer.EventsService().addAppointmentHistory({
    type: "paymentRefunded",
    data: {
      payment: {
        id: result.updatedPayment._id,
        amount: result.updatedPayment.amount,
        status: result.updatedPayment.status,
        method: result.updatedPayment.method,
        appName:
          "appName" in result.updatedPayment
            ? result.updatedPayment.appName
            : undefined,
        externalId:
          "externalId" in result.updatedPayment
            ? result.updatedPayment.externalId
            : undefined,
      },
      refundedAmount: amount,
      totalRefunded:
        result.updatedPayment.refunds?.reduce(
          (acc, refund) => acc + refund.amount,
          0,
        ) || 0,
    },
    appointmentId: result.updatedPayment.appointmentId,
  });

  logger.debug(
    {
      paymentId,
      success: result.success,
    },
    "Payment refund successful",
  );

  return NextResponse.json(
    { success: true, payment: result.updatedPayment },
    { status: 201 },
  );
}
