import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { SCHEDULED_NOTIFICATIONS_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type ScheduledNotificationsAdminKeys = Leaves<typeof adminKeys>;
export const scheduledNotificationsAdminNamespace =
  `app_${SCHEDULED_NOTIFICATIONS_APP_NAME}_admin` as const;

export type ScheduledNotificationsAdminNamespace =
  typeof scheduledNotificationsAdminNamespace;
export type ScheduledNotificationsAdminAllKeys = AllKeys<
  ScheduledNotificationsAdminNamespace,
  ScheduledNotificationsAdminKeys
>;
