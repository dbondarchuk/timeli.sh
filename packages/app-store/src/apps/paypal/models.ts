import { zNonEmptyString } from "@timelish/types";
import * as z from "zod";
import { PaypalAdminAllKeys } from "./translations/types";

export const paypalButtonsShape = ["rect", "pill", "sharp"] as const;
export const paypalButtonLayout = ["vertical", "horizontal"] as const;
export const paypalButtonColor = [
  "gold",
  "blue",
  "silver",
  "white",
  "black",
] as const;
export const paypalButtonLabel = ["paypal", "pay"] as const;

export const paypalConfigurationSchema = z.object({
  clientId: zNonEmptyString(
    "app_paypal_admin.validation.clientId.required" satisfies PaypalAdminAllKeys,
  ),
  secretKey: zNonEmptyString(
    "app_paypal_admin.validation.secretKey.required" satisfies PaypalAdminAllKeys,
  ),
  buttonStyle: z.object({
    shape: z.enum(paypalButtonsShape, {
      message:
        "app_paypal_admin.validation.buttonStyle.shape.invalid" satisfies PaypalAdminAllKeys,
    }),
    layout: z.enum(paypalButtonLayout, {
      message:
        "app_paypal_admin.validation.buttonStyle.layout.invalid" satisfies PaypalAdminAllKeys,
    }),
    color: z.enum(paypalButtonColor, {
      message:
        "app_paypal_admin.validation.buttonStyle.color.invalid" satisfies PaypalAdminAllKeys,
    }),
    label: z.enum(paypalButtonLabel, {
      message:
        "app_paypal_admin.validation.buttonStyle.label.invalid" satisfies PaypalAdminAllKeys,
    }),
  }),
});

export type PaypalConfiguration = z.infer<typeof paypalConfigurationSchema>;

export type PaypalFormProps = Omit<PaypalConfiguration, "secretKey"> & {
  isSandbox: boolean;
};

export const createOrderRequestSchema = z.object({
  paymentIntentId: zNonEmptyString(
    "app_paypal_admin.validation.paymentIntentId.required" satisfies PaypalAdminAllKeys,
  ),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const captureOrderRequestSchema = z.object({
  orderId: zNonEmptyString(
    "app_paypal_admin.validation.orderId.required" satisfies PaypalAdminAllKeys,
  ),
  paymentIntentId: zNonEmptyString(
    "app_paypal_admin.validation.paymentIntentId.required" satisfies PaypalAdminAllKeys,
  ),
});

export type CaptureOrderRequest = z.infer<typeof captureOrderRequestSchema>;
