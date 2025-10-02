import { getAppointmentEventAndIsPaymentRequired } from "@/utils/appointments/get-payment-required";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import {
  appointmentRequestSchema,
  CollectPayment,
  IPaymentProcessor,
  modifyAppointmentRequestSchema,
  PaymentIntentUpdateModel,
  PaymentType,
  paymentTypeSchema,
} from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";
import { getModifyAppointmentInformationRequestResult } from "../appointments/get-modify-appointment-request";

const createOrUpdateAppointmentRequestIntent = async (
  body: any,
  type: Exclude<PaymentType, "rescheduleFee">,
  intentId?: string,
): Promise<NextResponse> => {
  const logger = getLoggerFactory("PaymentsUtils")(
    "createOrUpdateAppointmentRequestIntent",
  );

  logger.debug({ type }, "Creating or updating appointment request intent");

  const {
    data: appointmentRequest,
    error,
    success,
  } = appointmentRequestSchema.safeParse(body);

  if (!success) {
    logger.error(
      {
        error,
        success,
        body,
      },
      "Failed to parse request",
    );

    return NextResponse.json(error, { status: 400 });
  }

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
  body: any,
  intentId?: string,
) => {
  const logger = getLoggerFactory("PaymentsUtils")(
    "createOrUpdateModifyAppointmentRequestIntent",
  );

  logger.debug({ intentId }, "Creating or updating intent");

  const {
    data: modifyAppointmentRequest,
    error,
    success,
  } = modifyAppointmentRequestSchema.safeParse(body);

  if (!success) {
    logger.error(
      {
        error,
        success,
        body,
      },
      "Failed to parse request",
    );

    return NextResponse.json(error, { status: 400 });
  }

  logger.debug({ modifyAppointmentRequest }, "Modify appointment request");

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
    success: typeSuccess,
    data: paymentType,
    error: typeError,
  } = paymentTypeSchema.safeParse(body?.paymentType);

  if (!typeSuccess) {
    logger.error({ typeError }, "Invalid payment type");
    return NextResponse.json(typeError, { status: 400 });
  }

  logger.debug({ type: paymentType, intentId }, "Type");

  if (paymentType !== "rescheduleFee") {
    return createOrUpdateAppointmentRequestIntent(body, paymentType, intentId);
  }

  return createOrUpdateModifyAppointmentRequestIntent(body, intentId);
};
