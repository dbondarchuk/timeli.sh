import { zNonEmptyString } from "@timelish/types";
import * as z from "zod";
import type { SquareAdminAllKeys } from "./translations/types";

export const squareMerchantDataSchema = z.object({
  locationId: zNonEmptyString(
    "app_square_admin.validation.locationId.required" satisfies SquareAdminAllKeys,
  ),
  merchantId: zNonEmptyString(
    "app_square_admin.validation.merchantId.required" satisfies SquareAdminAllKeys,
  ),
});

export type SquareMerchantData = z.infer<typeof squareMerchantDataSchema>;

export const squarePayRequestSchema = z.object({
  paymentIntentId: zNonEmptyString(
    "app_square_admin.validation.paymentIntentId.required" satisfies SquareAdminAllKeys,
  ),
  sourceId: zNonEmptyString(
    "app_square_admin.validation.sourceId.required" satisfies SquareAdminAllKeys,
  ),
});

export type SquarePayRequest = z.infer<typeof squarePayRequestSchema>;

export type SquareFormProps = {
  applicationId: string;
  locationId: string;
  isSandbox: boolean;
  className?: string;
};
