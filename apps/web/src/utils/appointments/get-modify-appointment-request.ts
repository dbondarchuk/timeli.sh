import { getLoggerFactory } from "@timelish/logger";
import {
  ModifyAppointmentInformation,
  ModifyAppointmentInformationRequest,
} from "@timelish/types";
import { formatAmount, getPolicyForRequest } from "@timelish/utils";
import { DateTime } from "luxon";
import { getServicesContainer } from "../utils";

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

  const servicesContainer = await getServicesContainer();
  const appointment = await servicesContainer.eventsService.findAppointment(
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
    await servicesContainer.configurationService.getConfiguration("booking");

  const option = await servicesContainer.servicesService.getOption(
    appointment.option._id,
  );

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
    const hasDeposit = appointment.payments?.some(
      (payment) => payment.type === "deposit" && payment.status === "paid",
    );

    let featureConfig =
      config.cancellationsAndReschedules.cancellations[
        hasDeposit ? "withDeposit" : "withoutDeposit"
      ];

    const optionConfig =
      option?.cancellationPolicy?.[
        hasDeposit ? "withDeposit" : "withoutDeposit"
      ];
    if (optionConfig?.type === "custom") {
      logger.debug(
        { optionId: option?._id },
        "Option has custom cancellation policy. Using it instead of general configuration.",
      );
      featureConfig = optionConfig;
    }

    if (!featureConfig.enabled) {
      return {
        information: {
          ...appointmentInformation,
          allowed: false,
          reason: "cancellation_not_allowed",
        },
        customerId: appointment.customerId,
      };
    }

    if (featureConfig.doNotAllowIfRescheduled) {
      const appointmentHistory =
        await servicesContainer.eventsService.getAppointmentHistory({
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

    if (policy.action === "allowed") {
      return {
        information: {
          ...appointmentInformation,
          allowed: true,
          type: "cancel",
          action: "allowed",
        },
        customerId: appointment.customerId,
      };
    }

    if (hasDeposit && policy.action === "forfeitDeposit") {
      return {
        information: {
          ...appointmentInformation,
          allowed: true,
          type: "cancel",
          action: "forfeitDeposit",
        },
        customerId: appointment.customerId,
      };
    }

    if (
      hasDeposit &&
      (policy.action === "partialRefund" || policy.action === "fullRefund")
    ) {
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
            acc +
            (payment.fees?.reduce((acc, fee) => acc + fee.amount, 0) ?? 0),
          0,
        ) ?? 0;

      const totalRefundableAmount =
        totalDepositsPaidOnline -
        (!policy.refundFees ? totalFeesPaidOnline : 0);

      const refundAmount = totalDepositsPaidOnline
        ? formatAmount((refundPercentage * totalRefundableAmount) / 100)
        : 0;

      return {
        information: {
          ...appointmentInformation,
          allowed: true,
          action: "refund",
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
    }

    if (policy.action === "paymentToFullPriceRequired") {
      const originalPrice = policy.calculateFromOriginalPrice
        ? (appointment.totalPrice ?? 0) +
          (appointment.discount?.discountAmount ?? 0)
        : (appointment.totalPrice ?? 0);

      if (!originalPrice) {
        return {
          information: {
            ...appointmentInformation,
            allowed: false,
            reason: "cancellation_not_allowed_by_policy",
          },
          customerId: appointment.customerId,
        };
      }

      const deposits = appointment.payments?.filter(
        (payment) => payment.type === "deposit" && payment.status === "paid",
      );

      const totalDeposits =
        deposits?.reduce((acc, payment) => acc + payment.amount, 0) ?? 0;

      const paymentAmount = formatAmount(originalPrice - totalDeposits);

      return {
        information: {
          ...appointmentInformation,
          allowed: true,
          action: "payment",
          paymentPolicy: policy.action,
          paymentAmount: paymentAmount,
          ...appointmentInformation,
          type: "cancel",
        },
        customerId: appointment.customerId,
      };
    }

    if (policy.action === "paymentRequired") {
      if (policy.paymentType === "amount") {
        return {
          information: {
            ...appointmentInformation,
            allowed: true,
            action: "payment",
            paymentPolicy: policy.action,
            paymentAmount: policy.paymentAmount,
            ...appointmentInformation,
            type: "cancel",
          },
          customerId: appointment.customerId,
        };
      }

      const originalPrice = policy.calculateFromOriginalPrice
        ? (appointment.totalPrice ?? 0) +
          (appointment.discount?.discountAmount ?? 0)
        : (appointment.totalPrice ?? 0);

      if (!originalPrice) {
        return {
          information: {
            ...appointmentInformation,
            allowed: false,
            reason: "cancellation_not_allowed_by_policy",
          },
          customerId: appointment.customerId,
        };
      }

      const paymentAmount = formatAmount(
        (originalPrice * (policy.paymentPercentage ?? 100)) / 100,
      );

      return {
        information: {
          ...appointmentInformation,
          allowed: true,
          action: "payment",
          paymentPolicy: policy.action,
          paymentAmount,
          ...appointmentInformation,
          type: "cancel",
        },
        customerId: appointment.customerId,
      };
    } else {
      return {
        information: {
          ...appointmentInformation,
          allowed: false,
          reason: "cancellation_not_allowed_by_policy",
        },
        customerId: appointment.customerId,
      };
    }
  } else if (request.type === "reschedule") {
    let featureConfig = config.cancellationsAndReschedules.reschedules;
    const optionConfig = option?.reschedulePolicy;
    if (optionConfig?.type === "custom") {
      logger.debug(
        { optionId: option?._id },
        "Option has custom reschedule policy. Using it instead of general configuration.",
      );
      featureConfig = optionConfig;
    }

    if (!featureConfig.enabled) {
      return {
        information: {
          ...appointmentInformation,
          allowed: false,
          reason: "reschedule_not_allowed",
        },
        customerId: appointment.customerId,
      };
    }

    // if (
    //   featureConfig.enabled === "notAllowedWithoutDeposit" &&
    //   !appointment.payments?.some(
    //     (payment) => payment.type === "deposit" && payment.status === "paid",
    //   )
    // ) {
    //   return {
    //     information: {
    //       ...appointmentInformation,
    //       allowed: false,
    //       reason: "original_appointment_deposit_required",
    //     },
    //     customerId: appointment.customerId,
    //   };
    // }

    if (featureConfig.maxReschedules) {
      const appointmentHistory =
        await servicesContainer.eventsService.getAppointmentHistory({
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

    if (policy.action === "allowed") {
      return {
        information: {
          ...appointmentInformation,
          allowed: true,
          action: policy.action,
          ...appointmentInformation,
          type: "reschedule",
          timeZone: appointment.timeZone,
        },
        customerId: appointment.customerId,
      };
    }

    if (policy.action === "paymentRequired") {
      if (policy.paymentType === "amount") {
        return {
          information: {
            ...appointmentInformation,
            allowed: true,
            action: "paymentRequired",
            paymentAmount: policy.paymentAmount,
            ...appointmentInformation,
            type: "reschedule",
            timeZone: appointment.timeZone,
          },
          customerId: appointment.customerId,
        };
      }

      const originalPrice = policy.calculateFromOriginalPrice
        ? (appointment.totalPrice ?? 0) +
          (appointment.discount?.discountAmount ?? 0)
        : (appointment.totalPrice ?? 0);

      if (!originalPrice) {
        return {
          information: {
            ...appointmentInformation,
            allowed: false,
            reason: "reschedule_not_allowed_by_policy",
          },
          customerId: appointment.customerId,
        };
      }

      const paymentAmount = formatAmount(
        (originalPrice * (policy.paymentPercentage ?? 100)) / 100,
      );

      return {
        information: {
          allowed: true,
          action: policy.action,
          paymentAmount: paymentAmount,
          ...appointmentInformation,
          type: "reschedule",
          timeZone: appointment.timeZone,
        },
        customerId: appointment.customerId,
      };
    }
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
