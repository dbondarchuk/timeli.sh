import { InStorePaymentUpdateModel, Payment } from "@vivid/types";
import { RefundPayments } from "../schemas/payments";
import { fetchAdminApi } from "./utils";

export const getPayment = async (id: string) => {
  console.debug({ paymentId: id }, "Getting payment");

  const response = await fetchAdminApi(`/payments/${id}`);
  const result = await response.json<Payment>();

  console.debug("Payment retrieved successfully", {
    paymentId: result._id,
  });

  return result;
};

export const deleteInstore = async (id: string) => {
  console.debug({ paymentId: id }, "Deleting payment");

  const response = await fetchAdminApi(`/payments/instore/${id}`, {
    method: "DELETE",
  });

  const result = await response.json<Payment>();

  console.debug("In-store appointment payment deleted successfully", {
    paymentId: result._id,
  });

  return result;
};

export const addInstore = async (
  id: string,
  payment: InStorePaymentUpdateModel,
) => {
  console.debug(
    { appointmentId: id, payment },
    "Adding in-store appointment payment",
  );

  const response = await fetchAdminApi("/payments/instore", {
    method: "POST",
    body: JSON.stringify({
      ...payment,
      appointmentId: id,
    }),
  });

  const result = await response.json<Payment>();

  console.debug("In-store appointment payment added successfully", {
    paymentId: result._id,
  });

  return result;
};

export const updateInstore = async (
  id: string,
  update: InStorePaymentUpdateModel,
) => {
  console.debug(
    { appointmentId: id, update },
    "Updating in-store appointment payment",
  );

  const response = await fetchAdminApi(`/payments/instore/${id}`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });

  const result = await response.json<Payment>();

  console.debug("In-store appointment payment updated successfully", {
    paymentId: result._id,
  });

  return result;
};

export const refundPayments = async (refunds: RefundPayments) => {
  console.debug("Refunding payments", { refunds });

  const response = await fetchAdminApi("/payments/refund", {
    method: "POST",
    body: JSON.stringify(refunds),
  });

  const result = await response.json<{
    success: boolean;
    updatedPayments: Record<string, Payment>;
    errors: Record<string, string>;
  }>();

  console.debug("Payments refunded successfully", {
    success: result.success,
    errors: result.errors,
  });

  return result;
};

export const refundPayment = async (id: string, amount: number) => {
  console.debug("Refunding payment", { id, amount });

  const response = await fetchAdminApi(`/payments/${id}/refund`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

  const result = await response.json<{
    success: boolean;
    payment: Payment;
    error: string;
  }>();

  console.debug("Payment refunded successfully", {
    success: result.success,
    error: result.error,
  });

  return result;
};
