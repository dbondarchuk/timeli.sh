"use client";

import { useI18n } from "@vivid/i18n";
import { Appointment } from "@vivid/types";
import { Button } from "@vivid/ui";
import { BanknoteArrowUp } from "lucide-react";
import { AddUpdatePaymentDialog, PaymentCard } from "../../payments";

type PaymentsTabProps = {
  appointment: Appointment;
};

export const PaymentsTab = ({ appointment }: PaymentsTabProps) => {
  const t = useI18n("admin");

  return (
    <div className="flex flex-col gap-4 @container/payments">
      <AddUpdatePaymentDialog
        appointmentId={appointment._id}
        onSuccess={(payment) => {
          appointment.payments = [...(appointment.payments || []), payment];
        }}
      >
        <Button variant="primary" className="w-full">
          <BanknoteArrowUp /> {t("appointments.payments.addPayment")}
        </Button>
      </AddUpdatePaymentDialog>
      {!!appointment.payments?.length ? (
        <div className="grid grid-cols-1 @2xl/payments:grid-cols-2 @4xl/payments:grid-cols-3 gap-2 py-2">
          {appointment.payments.map((payment) => (
            <PaymentCard
              payment={payment}
              key={payment._id}
              onDelete={(payment) => {
                appointment.payments = appointment.payments?.filter(
                  (p) => p._id !== payment._id,
                );
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 bg-card p-4 rounded border">
          <div className="font-semibold flex flex-row gap-1 items-center">
            {t("appointments.payments.noPayments")}
          </div>
        </div>
      )}
    </div>
  );
};
