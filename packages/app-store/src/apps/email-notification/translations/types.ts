import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { EMAIL_NOTIFICATION_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type EmailNotificationAdminKeys = Leaves<typeof adminKeys>;
export const emailNotificationAdminNamespace =
  `app_${EMAIL_NOTIFICATION_APP_NAME}_admin` as const;

export type EmailNotificationAdminNamespace =
  typeof emailNotificationAdminNamespace;
export type EmailNotificationAdminAllKeys = AllKeys<
  EmailNotificationAdminNamespace,
  EmailNotificationAdminKeys
>;
