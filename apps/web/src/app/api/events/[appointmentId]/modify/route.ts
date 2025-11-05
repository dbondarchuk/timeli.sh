import { getModifyAppointmentInformationRequestResult } from "@/utils/appointments/get-modify-appointment-request";
import { getServicesContainer } from "@/utils/utils";
import { getLoggerFactory } from "@timelish/logger";
import {
  ModifyAppointmentInformation,
  ModifyAppointmentRequest,
  modifyAppointmentRequestSchema,
  OnlinePayment,
} from "@timelish/types";
import { formatAmount } from "@timelish/utils";
import { NextRequest, NextResponse } from "next/server";

const processRescheduleRequest = async (
  request: Extract<ModifyAppointmentRequest, { type: "reschedule" }>,
  information: Extract<
    ModifyAppointmentInformation,
    { type: "reschedule"; allowed: true }
  >,
  customerId: string,
): Promise<NextResponse> => {
  const logger = getLoggerFactory("API/event/[appointmentId]/modify")(
    "processRescheduleRequest",
  );
  const servicesContainer = await getServicesContainer();
  const appointmentId = information.id;
  logger.debug(
    {
      appointmentId,
      dateTime: request.dateTime,
      duration: information.duration,
      paymentIntentId: request.paymentIntentId,
    },
    "Processing reschedule request",
  );

  const isAvailable =
    await servicesContainer.eventsService.verifyTimeAvailability(
      request.dateTime,
      information.duration,
    );

  if (!isAvailable) {
    return NextResponse.json(
      {
        success: false,
        code: "time_not_available",
        message: "Time is not available",
      },
      { status: 400 },
    );
  }

  let paymentIntentId = request.paymentIntentId;
  const config =
    await servicesContainer.configurationService.getConfiguration("booking");

  if (
    information.reschedulePolicy === "paymentRequired" &&
    config.payments?.enabled &&
    config.payments?.paymentAppId
  ) {
    if (!paymentIntentId) {
      logger.warn("Payment required but no payment intent provided");
      return NextResponse.json(
        { success: false, error: "payment_required" },
        { status: 402 },
      ); // Payment required
    }

    const paymentIntent =
      await servicesContainer.paymentsService.getIntent(paymentIntentId);
    if (!paymentIntent) {
      logger.warn({ paymentIntentId }, "Payment intent not found");
      return NextResponse.json(
        { success: false, error: "payment_intent_not_found" },
        { status: 402 },
      ); // Payment required
    }

    if (paymentIntent.status !== "paid") {
      logger.warn(
        { paymentIntentId, status: paymentIntent.status },
        "Payment not paid",
      );
      return NextResponse.json(
        { success: false, error: "payment_not_paid" },
        { status: 402 },
      ); // Payment required
    }

    if (paymentIntent.amount !== information.paymentAmount) {
      logger.warn(
        {
          paymentIntentId,
          paymentAmount: paymentIntent.amount,
          requiredAmount: information.paymentAmount,
        },
        "Payment amount mismatch",
      );
      return NextResponse.json(
        { success: false, error: "payment_amount_dont_match" },
        { status: 402 },
      ); // Payment required
    }

    const { name: appName } =
      await servicesContainer.connectedAppsService.getApp(
        config.payments?.paymentAppId,
      );

    logger.debug({ appName, paymentIntentId }, "Creating payment");

    const payment = (await servicesContainer.paymentsService.createPayment({
      amount: information.paymentAmount,
      status: "paid",
      paidAt: new Date(),
      appointmentId,
      customerId,
      description: "rescheduleFee",
      method: "online",
      intentId: paymentIntentId,
      appName,
      appId: config.payments?.paymentAppId,
      type: "rescheduleFee",
      fees: paymentIntent.fees,
    })) as OnlinePayment;

    await servicesContainer.eventsService.addAppointmentHistory({
      appointmentId,
      type: "paymentAdded",
      data: {
        payment: {
          id: payment._id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          type: "rescheduleFee",
          intentId: payment.intentId,
          externalId: payment.externalId,
          appName: payment.appName,
          appId: payment.appId,
        },
      },
    });
  } else if (paymentIntentId) {
    logger.warn("Payment not required but payment intent provided");

    const paymentIntent =
      await servicesContainer.paymentsService.getIntent(paymentIntentId);

    if (!paymentIntent) {
      logger.warn({ paymentIntentId }, "Payment intent not found");
      paymentIntentId = undefined;
    } else if (paymentIntent.status !== "paid") {
      logger.warn(
        { paymentIntentId },
        "Payment intent is not paid. Removing it",
      );
      paymentIntentId = undefined;
    }
  }

  await servicesContainer.eventsService.rescheduleAppointment(
    appointmentId,
    request.dateTime,
    information.duration,
    false,
  );

  logger.debug(
    {
      appointmentId,
      dateTime: request.dateTime,
      duration: information.duration,
    },
    "Appointment rescheduled successfully",
  );

  return NextResponse.json({
    success: true,
    code: "success",
    message: "Appointment rescheduled successfully",
  });
};

const processCancelRequest = async (
  information: Extract<
    ModifyAppointmentInformation,
    { type: "cancel"; allowed: true }
  >,
) => {
  const logger = getLoggerFactory("API/event/[appointmentId]/modify")(
    "processCancelRequest",
  );
  const servicesContainer = await getServicesContainer();
  const appointmentId = information.id;

  logger.debug({ appointmentId }, "Processing cancel request");

  if (
    (information.refundPolicy === "fullRefund" ||
      information.refundPolicy === "partialRefund") &&
    information.refundAmount > 0
  ) {
    logger.debug({ appointmentId }, "Refunding payments");

    const allPayments =
      await servicesContainer.paymentsService.getAppointmentPayments(
        appointmentId,
      );
    const paymentsToRefund = allPayments.filter(
      (payment) =>
        payment.status === "paid" &&
        payment.type === "deposit" &&
        payment.method === "online",
    );

    logger.debug(
      {
        appointmentId,
        paymentsToRefund: paymentsToRefund.length,
        paymentIds: paymentsToRefund.map((p) => p._id),
      },
      "Payments to refund",
    );

    let successfullyRefunded = 0;
    for (const payment of paymentsToRefund) {
      const fees = payment.fees?.reduce((acc, fee) => acc + fee.amount, 0) ?? 0;
      const feesToDeduct = !information.refundFees ? fees : 0;
      const amountToRefund =
        information.refundPolicy === "fullRefund"
          ? payment.amount - feesToDeduct
          : formatAmount(
              (payment.amount - feesToDeduct) *
                (information.refundPercentage / 100),
            );

      logger.debug(
        {
          appointmentId,
          paymentId: payment._id,
          amountToRefund,
          refundFees: information.refundFees,
        },
        "Refunding payment",
      );

      const result = await servicesContainer.paymentsService.refundPayment(
        payment._id,
        amountToRefund,
      );

      if (result.success) {
        logger.debug(
          { appointmentId, paymentId: payment._id, amountToRefund },
          "Payment refunded successfully",
        );

        successfullyRefunded++;
      } else {
        logger.warn(
          {
            appointmentId,
            paymentId: payment._id,
            error: result.error,
            amountToRefund,
          },
          "Payment refund failed",
        );
      }
    }

    logger.debug(
      {
        appointmentId,
        successfullyRefunded,
        paymentsToRefund: paymentsToRefund.length,
      },
      "Payments refunded",
    );
  }

  await servicesContainer.eventsService.changeAppointmentStatus(
    appointmentId,
    "declined",
  );

  logger.debug({ appointmentId }, "Appointment cancelled successfully");

  return NextResponse.json({
    success: true,
    code: "success",
    message: "Appointment cancelled successfully",
  });
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/events/[appointmentId]/modify">,
) {
  const logger = getLoggerFactory("API/event/[appointmentId]/modify")("POST");
  const { appointmentId } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      appointmentId,
    },
    "Processing API request to modify appointment",
  );

  const json = await request.json();

  const {
    data: modifyAppointmentRequest,
    success: parseSuccess,
    error: parseError,
  } = modifyAppointmentRequestSchema.safeParse(json);

  if (!parseSuccess) {
    logger.warn({ parseError }, "Invalid request format");
    return NextResponse.json(parseError, { status: 400 });
  }

  if (
    modifyAppointmentRequest.type === "reschedule" &&
    modifyAppointmentRequest.dateTime < new Date()
  ) {
    return NextResponse.json(
      {
        success: false,
        code: "invalid_date_time",
        message: "Invalid date time",
      },
      { status: 400 },
    );
  }

  logger.debug(
    {
      type: modifyAppointmentRequest.type,
      fieldsType: modifyAppointmentRequest.fields.type,
    },
    "Processing appointment cancel or reschedule request",
  );

  const eventOrError = await getModifyAppointmentInformationRequestResult(
    modifyAppointmentRequest,
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

  if (!information.allowed) {
    return NextResponse.json(
      {
        success: false,
        code: "not_allowed",
        message: "Not allowed by policy",
      },
      { status: 400 },
    );
  }

  if (information.id !== appointmentId) {
    return NextResponse.json(
      {
        success: false,
        code: "invalid_appointment_id",
        message: "Invalid appointment ID",
      },
      { status: 400 },
    );
  }

  if (modifyAppointmentRequest.type === "reschedule") {
    return await processRescheduleRequest(
      modifyAppointmentRequest,
      information as Extract<
        ModifyAppointmentInformation,
        { type: "reschedule"; allowed: true }
      >,
      eventOrError.customerId,
    );
  } else if (modifyAppointmentRequest.type === "cancel") {
    return await processCancelRequest(
      information as Extract<
        ModifyAppointmentInformation,
        { type: "cancel"; allowed: true }
      >,
    );
  } else {
    logger.warn(
      {
        appointmentId,
      },
      "Invalid appointment type",
    );

    return NextResponse.json(
      {
        success: false,
        code: "invalid_request_type",
        message: "Invalid request type",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    code: "success",
    message: "Appointment modified successfully",
  });
}
