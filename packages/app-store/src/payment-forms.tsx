import { PaymentAppFormProps } from "@timelish/types";
import type { ReactNode } from "react";
import { PAYPAL_APP_NAME } from "./apps/paypal/const";
import { PaypalForm } from "./apps/paypal/form";

export const PaymentAppForms: Record<
  string,
  (props: PaymentAppFormProps<any>) => ReactNode
> = {
  [PAYPAL_APP_NAME]: (props) => <PaypalForm {...props} />,
};
