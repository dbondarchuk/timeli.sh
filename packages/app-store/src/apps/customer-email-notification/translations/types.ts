import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { CUSTOMER_EMAIL_NOTIFICATION_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type CustomerEmailNotificationAdminKeys = Leaves<typeof adminKeys>;
export const customerEmailNotificationAdminNamespace =
  `app_${CUSTOMER_EMAIL_NOTIFICATION_APP_NAME}_admin` as const;

export type CustomerEmailNotificationAdminNamespace =
  typeof customerEmailNotificationAdminNamespace;
export type CustomerEmailNotificationAdminAllKeys = AllKeys<
  CustomerEmailNotificationAdminNamespace,
  CustomerEmailNotificationAdminKeys
>;
