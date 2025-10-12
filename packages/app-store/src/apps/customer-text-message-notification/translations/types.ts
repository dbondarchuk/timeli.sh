import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type CustomerTextMessageNotificationAdminKeys = Leaves<typeof adminKeys>;
export const customerTextMessageNotificationAdminNamespace =
  `app_${CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME}_admin` as const;

export type CustomerTextMessageNotificationAdminNamespace =
  typeof customerTextMessageNotificationAdminNamespace;
export type CustomerTextMessageNotificationAdminAllKeys = AllKeys<
  CustomerTextMessageNotificationAdminNamespace,
  CustomerTextMessageNotificationAdminKeys
>;
