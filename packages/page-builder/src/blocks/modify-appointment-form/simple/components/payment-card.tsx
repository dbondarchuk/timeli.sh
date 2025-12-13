"use client";

import React from "react";

import { PaymentAppForms } from "@timelish/app-store/payment-forms";
import { useI18n } from "@timelish/i18n";
import { formatAmountString } from "@timelish/utils";
import { useModifyAppointmentFormContext } from "./context";

export const PaymentCard: React.FC = () => {
  const i18n = useI18n("translation");
  const {
    appointment,
    paymentInformation: paymentForm,
    fields,
    onSubmit,
    type,
  } = useModifyAppointmentFormContext();
  if (!paymentForm) return null;

  const Form = PaymentAppForms[paymentForm.intent.appName];

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-3">
        <h2 className="mt-0 text-xl">{i18n(`${type}_fee_required_title`)}</h2>
      </div>
      <div className="text-sm mb-3">
        {i18n(`${type}_fee_required_description`, {
          totalPrice: formatAmountString(appointment?.price ?? 0),
          percentage: paymentForm.intent.percentage,
          amount: formatAmountString(paymentForm.intent.amount),
        })}
      </div>
      <Form
        fields={fields}
        {...paymentForm.formProps}
        intent={paymentForm.intent}
        onSubmit={onSubmit}
      />
    </div>
  );
};
