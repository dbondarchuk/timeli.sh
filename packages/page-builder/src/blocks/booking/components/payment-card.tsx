"use client";

import React from "react";

import { PaymentAppForms } from "@vivid/app-store/payment-forms";
import { useI18n } from "@vivid/i18n";
import { formatAmountString } from "@vivid/utils";
import { CardWithAppointmentInformation } from "./card-with-info";
import { useScheduleContext } from "./context";

export const PaymentCard: React.FC = () => {
  const i18n = useI18n("translation");
  const { paymentInformation: paymentForm, onSubmit } = useScheduleContext();
  if (!paymentForm) return null;

  const Form = PaymentAppForms[paymentForm.intent.appName];

  const isFullPayment = paymentForm.intent.percentage >= 100;

  return (
    <CardWithAppointmentInformation
      title={
        isFullPayment
          ? "payment_form_full_payment_required_title"
          : "payment_form_deposit_required_title"
      }
    >
      <div className="text-sm mb-3">
        {i18n(
          isFullPayment
            ? "payment_form_full_payment_required_description"
            : "payment_form_deposit_required_description",
          {
            percentage: paymentForm.intent.percentage,
            amount: formatAmountString(paymentForm.intent.amount),
          },
        )}
      </div>
      <Form
        {...paymentForm.formProps}
        intent={paymentForm.intent}
        onSubmit={onSubmit}
      />
    </CardWithAppointmentInformation>
  );
};
