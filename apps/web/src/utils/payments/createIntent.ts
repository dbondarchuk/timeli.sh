import { getAppointmentEventAndIsPaymentRequired } from "@/utils/appointments/get-payment-required";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import {
  AppointmentRequest,
  CollectPayment,
  createOrUpdatePaymentIntentRequestSchema,
  IPaymentProcessor,
  ModifyAppointmentRequest,
  PaymentIntentUpdateModel,
  PaymentType,
} from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";
import { getModifyAppointmentInformationRequestResult } from "../appointments/get-modify-appointment-request";

const createOrUpdateAppointmentRequestIntent = async (
  appointmentRequest: AppointmentRequest,
  type: Exclude<PaymentType, "rescheduleFee" | "cancellationFee">,
  intentId?: string,
): Promise<NextResponse> => {
  const logger = getLoggerFactory("PaymentsUtils")(
    "createOrUpdateAppointmentRequestIntent",
  );

  logger.debug({ type }, "Creating or updating appointment request intent");

  const isPaymentRequired = await getAppointmentEventAndIsPaymentRequired(
    appointmentRequest,
    true,
  );

  if (!isPaymentRequired) {
    logger.warn({ appointmentRequest }, "IsPaymentRequired is null");
    return NextResponse.json(null);
  }

  if ("error" in isPaymentRequired) {
    logger.error(
      {
        error: isPaymentRequired.error,
        appointmentRequest,
      },
      "Failed to get event or is payment required",
    );

    return NextResponse.json(
      {
        success: false,
        error: isPaymentRequired.error.code,
        message: isPaymentRequired.error.message,
      },
      { status: isPaymentRequired.error.status },
    );
  }

  if (!isPaymentRequired.isPaymentRequired) {
    logger.debug({ appointmentRequest }, "payment is not required");

    return NextResponse.json(null);
  }

  logger.debug({ ...isPaymentRequired, intentId }, "Payment is required.");

  const { amount, percentage, appId, customer } = isPaymentRequired;

  const { app, service } =
    await ServicesContainer.ConnectedAppsService().getAppService<IPaymentProcessor>(
      appId,
    );

  const formProps = service.getFormProps(app);

  const intentUpdate = {
    amount,
    percentage,
    appId: app._id,
    appName: app.name,
    request: appointmentRequest,
    customerId: customer?._id,
    type: type,
  } satisfies Omit<PaymentIntentUpdateModel, "status">;

  logger.debug(
    { intent: intentUpdate, isUpdating: !!intentId },
    "Creating or updating intent",
  );

  const intentResult = intentId
    ? await ServicesContainer.PaymentsService().updateIntent(intentId, {
        ...intentUpdate,
        status: "created",
      })
    : await ServicesContainer.PaymentsService().createIntent(intentUpdate);

  const { request: _, ...intent } = intentResult;

  logger.debug(
    { intent, isUpdating: !!intentId },
    "Successfully created or updated intent",
  );

  return NextResponse.json({
    formProps,
    intent,
  } satisfies CollectPayment);
};

const createOrUpdateModifyAppointmentRequestIntent = async (
  modifyAppointmentRequest: ModifyAppointmentRequest,
  type: Extract<PaymentType, "rescheduleFee" | "cancellationFee">,
  intentId?: string,
) => {
  const logger = getLoggerFactory("PaymentsUtils")(
    "createOrUpdateModifyAppointmentRequestIntent",
  );

  logger.debug({ intentId }, "Creating or updating intent");

  if (
    type === "rescheduleFee" &&
    modifyAppointmentRequest.type !== "reschedule"
  ) {
    logger.error(
      { modifyAppointmentRequest, type },
      "Modify appointment request is not a reschedule",
    );

    return NextResponse.json(
      {
        error: {
          code: "modify_appointment_request_not_a_reschedule",
          message: "Modify appointment request is not a reschedule",
        },
      },
      { status: 400 },
    );
  }

  if (
    type === "cancellationFee" &&
    modifyAppointmentRequest.type !== "cancel"
  ) {
    logger.error(
      { modifyAppointmentRequest, type },
      "Modify appointment request is not a cancellation",
    );

    return NextResponse.json(
      {
        error: {
          code: "modify_appointment_request_not_a_cancellation",
          message: "Modify appointment request is not a cancellation",
        },
      },
      { status: 400 },
    );
  }

  const modifyAppointmentRequestResult =
    await getModifyAppointmentInformationRequestResult(
      modifyAppointmentRequest,
    );

  if ("error" in modifyAppointmentRequestResult) {
    logger.error(
      { modifyAppointmentRequestResult },
      "Failed to get modify appointment request",
    );
    return NextResponse.json(modifyAppointmentRequestResult.error, {
      status: 400,
    });
  }

  const { information, customerId } = modifyAppointmentRequestResult;

  if (!information.allowed) {
    logger.debug(
      { modifyAppointmentRequestResult },
      "Modify appointment request not allowed",
    );
    return NextResponse.json(null);
  }

  if (
    information.type !== "reschedule" ||
    information.reschedulePolicy !== "paymentRequired"
  ) {
    logger.debug(
      { modifyAppointmentRequestResult },
      "Modify appointment request not required to pay",
    );
    return NextResponse.json(null);
  }

  logger.debug(
    { modifyAppointmentRequestResult, intentId },
    "Payment is required.",
  );

  const { paymentPercentage, paymentAmount } = information;

  const config =
    await ServicesContainer.ConfigurationService().getConfiguration("booking");
  if (!config.payments?.enabled || !config.payments.paymentAppId) {
    logger.debug({ config }, "Payments are not enabled");
    return NextResponse.json(null);
  }

  const { app, service } =
    await ServicesContainer.ConnectedAppsService().getAppService<IPaymentProcessor>(
      config.payments.paymentAppId,
    );

  const formProps = service.getFormProps(app);

  const intentUpdate = {
    amount: paymentAmount,
    percentage: paymentPercentage,
    appId: app._id,
    appName: app.name,
    request: modifyAppointmentRequest,
    customerId,
    type: "rescheduleFee",
  } satisfies Omit<PaymentIntentUpdateModel, "status">;

  logger.debug(
    { intent: intentUpdate, isUpdating: !!intentId },
    "Creating or updating intent",
  );

  const intentResult = intentId
    ? await ServicesContainer.PaymentsService().updateIntent(intentId, {
        ...intentUpdate,
        status: "created",
      })
    : await ServicesContainer.PaymentsService().createIntent(intentUpdate);

  const { request: _, ...intent } = intentResult;

  logger.debug(
    { intent, isUpdating: !!intentId },
    "Successfully created or updated intent",
  );

  return NextResponse.json({
    formProps,
    intent,
  } satisfies CollectPayment);
};

export const createOrUpdateIntent = async (
  request: NextRequest,
  intentId?: string,
) => {
  const logger = getLoggerFactory("PaymentsUtils")("createOrUpdateIntent");
  const body = await request.json();

  logger.debug({ intentId }, "Creating or updating intent");

  const {
    success: createOrUpdatePaymentIntentRequestSuccess,
    data: createOrUpdatePaymentIntentRequest,
    error: createOrUpdatePaymentIntentRequestError,
  } = createOrUpdatePaymentIntentRequestSchema.safeParse(body);

  if (!createOrUpdatePaymentIntentRequestSuccess) {
    logger.error(
      { createOrUpdatePaymentIntentRequestError },
      "Invalid payment type",
    );

    return NextResponse.json(
      {
        error: createOrUpdatePaymentIntentRequestError,
        code: "invalid_request_format",
        success: false,
      },
      { status: 400 },
    );
  }

  logger.debug(
    { type: createOrUpdatePaymentIntentRequest.type, intentId },
    "Type",
  );

  if (
    createOrUpdatePaymentIntentRequest.type !== "rescheduleFee" &&
    createOrUpdatePaymentIntentRequest.type !== "cancellationFee"
  ) {
    return createOrUpdateAppointmentRequestIntent(
      createOrUpdatePaymentIntentRequest.request as AppointmentRequest,
      createOrUpdatePaymentIntentRequest.type,
      intentId,
    );
  }

  return createOrUpdateModifyAppointmentRequestIntent(
    createOrUpdatePaymentIntentRequest.request,
    createOrUpdatePaymentIntentRequest.type,
    intentId,
  );
};
