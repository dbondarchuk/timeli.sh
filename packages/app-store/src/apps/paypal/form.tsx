"use client";

import {
  PayPalButtons,
  PayPalCardFieldsProvider,
  PayPalCVVField,
  PayPalExpiryField,
  PayPalNameField,
  PayPalNumberField,
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import { useI18n } from "@vivid/i18n";
import { PaymentAppFormProps } from "@vivid/types";
import { Button, Spinner, toast } from "@vivid/ui";
import React from "react";
import { PaypalLogo } from "./logo";
import { PaypalFormProps } from "./models";
import {
  PaypalPublicKeys,
  PaypalPublicNamespace,
  paypalPublicNamespace,
} from "./translations/types";
import { PaypalOrder } from "./types";

const SubmitPayment: React.FC<{
  isPaying: boolean;
  setIsPaying: (val: boolean) => void;
  billingAddress: any;
}> = ({ isPaying, setIsPaying, billingAddress }) => {
  const { cardFieldsForm } = usePayPalCardFields();
  const t = useI18n<PaypalPublicNamespace, PaypalPublicKeys>(
    paypalPublicNamespace,
  );

  const handleClick = async () => {
    if (!cardFieldsForm) {
      const childErrorMessage = t("form.cardFieldsProviderError");
      throw new Error(childErrorMessage);
    }

    const formState = await cardFieldsForm.getState();

    if (!formState.isFormValid) {
      // return alert("The payment form is invalid");
      return;
    }

    setIsPaying(true);

    cardFieldsForm.submit().finally(() => {
      setIsPaying(false);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="w-full text-lg"
        size="lg"
        onClick={handleClick}
        disabled={isPaying}
      >
        {isPaying && <Spinner />} <PaypalLogo /> {t("form.ui.payButton")}
      </Button>
      {}
    </div>
  );
};

export const PaypalForm: React.FC<PaymentAppFormProps<PaypalFormProps>> = ({
  clientId,
  buttonStyle,
  intent,
  onSubmit,
  isSandbox,
}) => {
  const t = useI18n<PaypalPublicNamespace, PaypalPublicKeys>(
    paypalPublicNamespace,
  );

  const [isPaying, setIsPaying] = React.useState(false);

  const initialOptions: ReactPayPalScriptOptions = {
    clientId,
    enableFunding: "applepay",
    disableFunding: "paylater",
    buyerCountry: isSandbox ? "US" : undefined,
    currency: "USD",
    components: ["buttons", "applepay", "card-fields"],
  };

  const [billingAddress, setBillingAddress] = React.useState({
    addressLine1: "",
    addressLine2: "",
    adminArea1: "",
    adminArea2: "",
    countryCode: "",
    postalCode: "",
  });

  const handleBillingAddressChange = (field: string, value: string) => {
    setBillingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createOrder = async () => {
    try {
      const response = await fetch(`/api/apps/${intent.appId}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: intent._id,
        }),
      });

      const orderData = await response.json();

      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : JSON.stringify(orderData);

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      return `Could not initiate PayPal Checkout...${error}`;
    }
  };

  const onApprove = async (
    data: Parameters<
      NonNullable<React.ComponentProps<typeof PayPalButtons>["onApprove"]>
    >[0],
  ) => {
    try {
      const response = await fetch(`/api/apps/${intent.appId}/orders/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: data.orderID,
          paymentIntentId: intent._id,
        }),
      });

      const orderData = (await response.json()) as PaypalOrder;

      // Three cases to handle:
      //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
      //   (2) Other non-recoverable errors -> Show a failure message
      //   (3) Successful transaction -> Show confirmation or thank you message

      const transaction =
        orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
        orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];

      const status = orderData.status;

      if (
        status !== "COMPLETED" ||
        !transaction ||
        transaction.status !== "COMPLETED"
      ) {
        throw new Error(JSON.stringify(orderData));
      } else {
        onSubmit();
      }
    } catch (error) {
      console.error(`Payment has failed`, error);
      toast.error(t("toast.payment_failed"), {
        description: t("toast.payment_failed_description"),
      });
    }
  };

  function onError(error: any) {
    console.error(`Payment has failed`, error);
    toast.error(t("toast.payment_failed"), {
      description: t("toast.payment_failed_description"),
    });
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={(data) => onApprove(data)}
          onError={onError}
          style={{
            ...buttonStyle,
            disableMaxWidth: true,
          }}
        />

        <div className="items-center flex my-px text-center">
          <div className="bg-muted flex-1 h-px mx-2" />
          <span className="text-sm text-muted-foreground uppercase">
            {t("form.ui.or")}
          </span>
          <div className="bg-muted flex-1 h-px mx-2" />
        </div>

        <PayPalCardFieldsProvider
          createOrder={createOrder}
          onApprove={(data) => onApprove(data)}
          onError={onError}
          style={{
            input: {
              "font-size": "0.875rem",
              "line-height": "1.25rem",
              // @ts-ignore it's there
              height: "2rem",
            },
          }}
        >
          <PayPalNameField />
          <PayPalNumberField style={{}} />
          <PayPalExpiryField style={{}} />
          <PayPalCVVField style={{}} />
          {/* <input
            type="text"
            id="card-billing-address-line-2"
            name="card-billing-address-line-2"
            placeholder="Address line 1"
            onChange={(e) =>
              handleBillingAddressChange("addressLine1", e.target.value)
            }
          />
          <input
            type="text"
            id="card-billing-address-line-2"
            name="card-billing-address-line-2"
            placeholder="Address line 2"
            onChange={(e) =>
              handleBillingAddressChange("addressLine2", e.target.value)
            }
          />
          <input
            type="text"
            id="card-billing-address-admin-area-line-1"
            name="card-billing-address-admin-area-line-1"
            placeholder="Admin area line 1"
            onChange={(e) =>
              handleBillingAddressChange("adminArea1", e.target.value)
            }
          />
          <input
            type="text"
            id="card-billing-address-admin-area-line-2"
            name="card-billing-address-admin-area-line-2"
            placeholder="Admin area line 2"
            onChange={(e) =>
              handleBillingAddressChange("adminArea2", e.target.value)
            }
          />
          <input
            type="text"
            id="card-billing-address-country-code"
            name="card-billing-address-country-code"
            placeholder="Country code"
            onChange={(e) =>
              handleBillingAddressChange("countryCode", e.target.value)
            }
          />
          <input
            type="text"
            id="card-billing-address-postal-code"
            name="card-billing-address-postal-code"
            placeholder="Postal/zip code"
            onChange={(e) =>
              handleBillingAddressChange("postalCode", e.target.value)
            }
          /> */}
          {/* Custom client component to handle card fields submission */}
          <SubmitPayment
            isPaying={isPaying}
            setIsPaying={setIsPaying}
            billingAddress={billingAddress}
          />
        </PayPalCardFieldsProvider>
      </PayPalScriptProvider>
    </div>
  );
};
