import { InStorePaymentUpdateModel, Payment } from "@vivid/types";
import { fetchWithJson } from "@vivid/utils";

export const deletePayment = async (id: string) => {
  console.debug({ paymentId: id }, "Deleting payment");

  const response = await fetchWithJson(`/admin/api/payments/instore/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    console.error(
      { paymentId: id },
      "Failed to delete in-store appointment payment",
    );
    throw new Error("Failed to delete in-store appointment payment");
  }

  const result = (await response.json()) as Payment;
  return result;
};

export const addAppointmentPayment = async (
  id: string,
  payment: InStorePaymentUpdateModel,
) => {
  console.debug(
    { appointmentId: id, payment },
    "Adding in-store appointment payment",
  );

  const response = await fetchWithJson("/admin/api/payments/instore", {
    method: "POST",
    body: JSON.stringify({
      ...payment,
      appointmentId: id,
    }),
  });

  if (!response.ok) {
    console.error(
      { appointmentId: id, payment },
      "Failed to add in-store appointment payment",
    );
    throw new Error("Failed to add in-store appointment payment");
  }

  const result = (await response.json()) as Payment;
  return result;
};

export const updateAppointmentPayment = async (
  id: string,
  update: InStorePaymentUpdateModel,
) => {
  console.debug(
    { appointmentId: id, update },
    "Updating in-store appointment payment",
  );

  const response = await fetchWithJson(`/admin/api/payments/instore/${id}`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });

  if (!response.ok) {
    console.error(
      { appointmentId: id, update },
      "Failed to update in-store appointment payment",
    );
    throw new Error("Failed to update in-store appointment payment");
  }

  const result = (await response.json()) as Payment;
  return result;
};
