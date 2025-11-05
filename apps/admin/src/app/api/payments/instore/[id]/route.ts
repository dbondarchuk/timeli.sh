import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import { inStorePaymentUpdateModelSchema } from "@timelish/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/payments/instore/[id]">,
) {
  const logger = getLoggerFactory("AdminAPI/payments/instore/[id]")("PATCH");
  const servicesContainer = await getServicesContainer();
  const id = (await params).id;
  logger.debug(
    {
      url: request.url,
      method: request.method,
      id,
    },
    "Processing update instore payments API request",
  );

  const body = await request.json();

  const {
    data: update,
    success,
    error,
  } = inStorePaymentUpdateModelSchema.partial().safeParse(body);

  if (!success || !update) {
    logger.warn("Invalid request format");
    return NextResponse.json(
      { success: false, error, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  const payment = await servicesContainer.paymentsService.getPayment(id);
  if (!payment) {
    logger.error({ paymentId: id }, "Payment not found");
    return NextResponse.json(
      { success: false, error: "Payment not found", code: "payment_not_found" },
      { status: 404 },
    );
  }

  if (payment.method === "online") {
    logger.error({ paymentId: id }, "Cannot update online payment");
    return NextResponse.json(
      {
        success: false,
        error: "Cannot update online payment",
        code: "cannot_update_online_payment",
      },
      { status: 400 },
    );
  }

  logger.debug(
    { paymentId: id, update },
    "Updating in-store appointment payment",
  );

  const result = await servicesContainer.paymentsService.updatePayment(
    id,
    update,
  );

  logger.debug(
    { paymentId: id, update },
    "In-store appointment payment added successfully",
  );

  return NextResponse.json(result, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext<"/api/payments/instore/[id]">,
) {
  const logger = getLoggerFactory("AdminAPI/payments/instore/[id]")("DELETE");
  const servicesContainer = await getServicesContainer();
  const id = (await params).id;
  logger.debug(
    { url: request.url, method: request.method, id },
    "Processing delete instore payments API request",
  );

  const payment = await servicesContainer.paymentsService.getPayment(id);
  if (!payment) {
    logger.error({ paymentId: id }, "Payment not found");
    return NextResponse.json(
      { success: false, error: "Payment not found", code: "payment_not_found" },
      { status: 404 },
    );
  }

  if (payment.method === "online") {
    logger.error({ paymentId: id }, "Cannot delete online payment");
    return NextResponse.json(
      {
        success: false,
        error: "Cannot delete online payment",
        code: "cannot_delete_online_payment",
      },
      { status: 400 },
    );
  }

  await servicesContainer.paymentsService.deletePayment(id);

  logger.debug(
    { paymentId: id },
    "In-store appointment payment deleted successfully",
  );

  return NextResponse.json(payment, { status: 200 });
}
