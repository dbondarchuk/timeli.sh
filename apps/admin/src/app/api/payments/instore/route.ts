import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import {
  inStorePaymentUpdateModelSchema,
  PaymentUpdateModel,
} from "@timelish/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/payments/instore")("POST");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing add instore payments API request",
  );

  const body = await request.json();

  const {
    data: payment,
    success,
    error,
  } = inStorePaymentUpdateModelSchema.safeParse(body);

  if (!success) {
    logger.warn("Invalid request format");
    return NextResponse.json(
      { success: false, error, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  let customerId: string | undefined;

  if (payment.appointmentId) {
    const appointment = await servicesContainer.eventsService.getAppointment(
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

    customerId = appointment.customerId;
  } else if ("customerId" in payment && payment.customerId) {
    const customer = await servicesContainer.customersService.getCustomer(
      payment.customerId,
    );

    if (!customer) {
      logger.error(
        { customerId: payment.customerId, payment },
        "Customer not found",
      );

      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
          code: "customer_not_found",
        },
        { status: 404 },
      );
    }

    customerId = customer._id;
  }

  if (!customerId) {
    logger.error({ payment }, "Customer ID not found");
    return NextResponse.json(
      {
        success: false,
        error: "Customer ID not found",
        code: "customer_id_not_found",
      },
      { status: 400 },
    );
  }

  let paymentUpdateModel: PaymentUpdateModel;

  if (payment.method === "gift-card") {
    const giftCard = await servicesContainer.giftCardsService.getGiftCard(
      payment.giftCardId,
    );
    if (!giftCard) {
      return NextResponse.json(
        {
          success: false,
          error: "Gift card not found",
          code: "gift_card_not_found",
        },
        { status: 404 },
      );
    }

    if (giftCard.amountLeft < payment.amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Gift card amount is not enough",
          code: "gift_card_amount_not_enough",
        },
        { status: 400 },
      );
    }

    paymentUpdateModel = {
      ...payment,
      customerId,
      status: "paid",
      method: "gift-card",
      giftCardCode: giftCard.code,
      giftCardId: giftCard._id,
    };
  } else {
    paymentUpdateModel = {
      ...payment,
      customerId,
      status: "paid",
    };
  }

  const result =
    await servicesContainer.paymentsService.createPayment(paymentUpdateModel);

  logger.debug(
    { appointmentId: payment.appointmentId, payment },
    "In-store appointment payment added successfully",
  );

  return NextResponse.json(result, { status: 201 });
}
