import { AvailableApps } from "@timelish/app-store";
import { AllKeys } from "@timelish/i18n";
import { PaymentMethod } from "@timelish/types";
import { CircleDollarSign, CreditCard, Gift } from "lucide-react";

export const getPaymentMethod = (
  method: PaymentMethod,
  appName?: string,
): AllKeys => {
  return method === "online" && appName
    ? AvailableApps[appName]?.displayName
    : method === "gift-card"
      ? "admin.payment.methods.giftCard"
      : method === "cash"
        ? "admin.payment.methods.cash"
        : "admin.payment.methods.card";
};

export const getPaymentMethodIcon = (
  method: PaymentMethod,
  appName?: string,
) => {
  const Icon =
    method === "online" && appName
      ? AvailableApps[appName]?.Logo
      : method === "gift-card"
        ? Gift
        : method === "cash"
          ? CircleDollarSign
          : CreditCard;

  return <Icon className="size-6" />;
};
