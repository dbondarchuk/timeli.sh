import { AllKeys } from "@timelish/i18n";
import { Leaves } from "@timelish/types";
import { PAYPAL_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";
import type publicKeys from "./en/public.json";

export type PaypalAdminKeys = Leaves<typeof adminKeys>;
export const paypalAdminNamespace = `app_${PAYPAL_APP_NAME}_admin` as const;

export type PaypalAdminNamespace = typeof paypalAdminNamespace;

export type PaypalAdminAllKeys = AllKeys<PaypalAdminNamespace, PaypalAdminKeys>;

export type PaypalPublicKeys = Leaves<typeof publicKeys>;
export const paypalPublicNamespace = `app_${PAYPAL_APP_NAME}_public` as const;

export type PaypalPublicNamespace = typeof paypalPublicNamespace;

export type PaypalPublicAllKeys = AllKeys<
  PaypalPublicNamespace,
  PaypalPublicKeys
>;
