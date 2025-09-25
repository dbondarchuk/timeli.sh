"use server";

import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { InStorePaymentUpdateModel, PaymentUpdateModel } from "@vivid/types";

const loggerFactory = getLoggerFactory("PaymentsActions");

export const deletePayment = async (id: string) => {
  const logger = loggerFactory("deletePayment");
  logger.debug({ paymentId: id }, "Deleting payment");

  const payment = await ServicesContainer.PaymentsService().getPayment(id);
  if (!payment) {
    logger.error({ paymentId: id }, "Payment not found");
    throw new Error("Payment not found");
  }

  if (payment.type === "online") {
    logger.error({ paymentId: id }, "Cannot delete online payment");
    throw new Error("Cannot delete online payment");
  }

  await ServicesContainer.PaymentsService().deletePayment(id);

  return payment;
};

export const addAppointmentPayment = async (
  id: string,
  payment: InStorePaymentUpdateModel,
) => {
  const actionLogger = loggerFactory("addAppointmentPayment");

  actionLogger.debug(
    { appointmentId: id, payment },
    "Adding in-store appointment payment",
  );

  const appointment = await ServicesContainer.EventsService().getAppointment(
    payment.appointmentId,
  );

  if (!appointment) {
    actionLogger.error({ appointmentId: id, payment }, "Appointment not found");

    throw new Error("Appointment not found");
  }

  const paymentUpdateModel: PaymentUpdateModel = {
    ...payment,
    appointmentId: id,
    customerId: appointment.customerId,
    status: "paid",
  };

  const result =
    await ServicesContainer.PaymentsService().createPayment(paymentUpdateModel);

  actionLogger.debug(
    { appointmentId: id, payment },
    "In-store appointment payment added successfully",
  );

  return result;
};

export const updateAppointmentPayment = async (
  id: string,
  update: InStorePaymentUpdateModel,
) => {
  const actionLogger = loggerFactory("updateAppointmentPayment");

  actionLogger.debug(
    { appointmentId: id, update },
    "Updating in-store appointment payment",
  );

  const payment = await ServicesContainer.PaymentsService().getPayment(id);
  if (!payment) {
    actionLogger.error({ paymentId: id }, "Payment not found");
    throw new Error("Payment not found");
  }

  if (payment.type === "online") {
    actionLogger.error({ paymentId: id }, "Cannot update online payment");
    throw new Error("Cannot update online payment");
  }

  const result = await ServicesContainer.PaymentsService().updatePayment(
    id,
    update,
  );

  actionLogger.debug(
    { appointmentId: id, payment },
    "In-store appointment payment updated successfully",
  );

  return result;
};
