import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import {
  ModifyAppointmentInformation,
  ModifyAppointmentInformationRequest,
} from "@vivid/types";
import { formatAmount, getPolicyForRequest } from "@vivid/utils";
import { DateTime } from "luxon";

export const getModifyAppointmentInformationRequestResult = async (
  request: ModifyAppointmentInformationRequest,
): Promise<
  | { information: ModifyAppointmentInformation; customerId: string }
  | { error: { code: string; message: string; status: number } }
> => {
  const logger = getLoggerFactory("AppointmentsUtils")(
    "getModifyAppointmentRequest",
  );

  logger.debug({ request }, "Finding appointment");

  const appointment = await ServicesContainer.EventsService().findAppointment(
    request.fields,
    ["confirmed", "pending"],
  );
  if (
    !appointment ||
    appointment.status === "declined" ||
    appointment.dateTime < new Date()
  ) {
    logger.warn({ request }, "Appointment not found");
    return {
      error: {
        code: "appointment_not_found",
        message: "Appointment not found",
        status: 404,
      },
    };
  }

  logger.debug({ request }, "Appointment found");

  const config =
    await ServicesContainer.ConfigurationService().getConfiguration("booking");

  const appointmentInformation = {
    type: request.type,
    id: appointment._id,
    name: appointment.customer?.name,
    optionName: appointment.option.name,
    addonsNames: appointment.addons?.map((addon) => addon.name),
    dateTime: appointment.dateTime,
    timeZone: appointment.timeZone,
    duration: appointment.totalDuration,
    price: appointment.totalPrice,
  };

  if (request.type === "cancel") {
    const featureConfig = config.cancellationsAndReschedules.cancellations;
    if (!featureConfig.enabled || featureConfig.enabled === "disabled") {
      return {
        information: {
          ...appointmentInformation,
          allowed: false,
          reason: "cancellation_not_allowed",
        },
        customerId: appointment.customerId,
      };
    }

    if (
      featureConfig.enabled === "notAllowedWithoutDeposit" &&
      !appointment.payments?.some(
        (payment) => payment.type === "deposit" && payment.status === "paid",
      )
    ) {
      return {
        information: {
          ...appointmentInformation,
          allowed: false,
          reason: "original_appointment_deposit_required",
        },
        customerId: appointment.customerId,
      };
    }

    if (featureConfig.doNotAllowIfRescheduled) {
      const appointmentHistory =
        await ServicesContainer.EventsService().getAppointmentHistory({
          appointmentId: appointment._id,
          type: "rescheduled",
          limit: 0, // we don't need to get history entries, we only need to check the total number of reschedules
        });

      if (appointmentHistory.total >= 1) {
        return {
          information: {
            ...appointmentInformation,
            allowed: false,
            reason: "rescheduled_appointment_not_allowed",
          },
          customerId: appointment.customerId,
        };
      }
    }

    const policy = getPolicyForRequest(
      featureConfig,
      appointment.dateTime,
      DateTime.now(),
    );

    if (!policy || policy.action === "notAllowed") {
      return {
        information: {
          ...appointmentInformation,
          allowed: false,
          reason: "cancellation_not_allowed_by_policy",
        },
        customerId: appointment.customerId,
      };
    }

    const refundPercentage =
      policy.action === "partialRefund"
        ? (policy.refundPercentage ?? 0)
        : policy.action === "fullRefund"
          ? 100
          : 0;

    const depositsPaidOnline = appointment.payments?.filter(
      (payment) =>
        payment.method === "online" &&
        payment.status === "paid" &&
        payment.type === "deposit",
    );

    const totalDepositsPaidOnline =
      depositsPaidOnline?.reduce((acc, payment) => acc + payment.amount, 0) ??
      0;

    const totalFeesPaidOnline =
      depositsPaidOnline?.reduce(
        (acc, payment) =>
          acc + (payment.fees?.reduce((acc, fee) => acc + fee.amount, 0) ?? 0),
        0,
      ) ?? 0;

    const totalRefundableAmount =
      totalDepositsPaidOnline - (!policy.refundFees ? totalFeesPaidOnline : 0);

    const refundAmount = totalDepositsPaidOnline
      ? formatAmount((refundPercentage * totalRefundableAmount) / 100)
      : 0;

    return {
      information: {
        ...appointmentInformation,
        allowed: true,
        refundPolicy: policy.action,
        refundPercentage: refundPercentage,
        refundAmount: refundAmount,
        refundFees: !!policy.refundFees,
        feesAmount: totalFeesPaidOnline,
        ...appointmentInformation,
        type: "cancel",
      },
      customerId: appointment.customerId,
    };
  } else if (request.type === "reschedule") {
    const featureConfig = config.cancellationsAndReschedules.reschedules;
    if (!featureConfig.enabled || featureConfig.enabled === "disabled") {
      return {
        information: {
          ...appointmentInformation,
          allowed: false,
          reason: "reschedule_not_allowed",
        },
        customerId: appointment.customerId,
      };
    }

    if (
      featureConfig.enabled === "notAllowedWithoutDeposit" &&
      !appointment.payments?.some(
        (payment) => payment.type === "deposit" && payment.status === "paid",
      )
    ) {
      return {
        information: {
          ...appointmentInformation,
          allowed: false,
          reason: "original_appointment_deposit_required",
        },
        customerId: appointment.customerId,
      };
    }

    if (featureConfig.maxReschedules) {
      const appointmentHistory =
        await ServicesContainer.EventsService().getAppointmentHistory({
          appointmentId: appointment._id,
          type: "rescheduled",
          limit: 0, // we don't need to get history entries, we only need to check the total number of reschedules
        });

      if (appointmentHistory.total >= featureConfig.maxReschedules) {
        return {
          information: {
            ...appointmentInformation,
            allowed: false,
            reason: "max_reschedules_reached",
          },
          customerId: appointment.customerId,
        };
      }
    }

    const policy = getPolicyForRequest(
      featureConfig,
      appointment.dateTime,
      DateTime.now(),
    );

    if (!policy || policy.action === "notAllowed") {
      return {
        information: {
          ...appointmentInformation,
          allowed: false,
          reason: "reschedule_not_allowed_by_policy",
        },
        customerId: appointment.customerId,
      };
    }

    return {
      information: {
        allowed: true,
        reschedulePolicy: policy.action,
        paymentPercentage: policy.paymentPercentage ?? 0,
        paymentAmount: policy.paymentPercentage
          ? (policy.paymentPercentage * (appointment.totalPrice ?? 0)) / 100
          : 0,
        ...appointmentInformation,
        type: "reschedule",
        timeZone: appointment.timeZone,
      },
      customerId: appointment.customerId,
    };
  }

  logger.warn({ request }, "Invalid request type");
  return {
    error: {
      code: "invalid_request_type",
      message: "Invalid request type",
      status: 400,
    },
  };
};
