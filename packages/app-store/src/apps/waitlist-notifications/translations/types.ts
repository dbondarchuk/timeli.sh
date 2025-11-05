import { AllKeys } from "@timelish/i18n";
import { Leaves } from "@timelish/types";
import { WAITLIST_NOTIFICATIONS_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export const waitlistNotificationsAdminNamespace = `app_${WAITLIST_NOTIFICATIONS_APP_NAME}_admin`;

export type WaitlistNotificationsAdminNamespace =
  typeof waitlistNotificationsAdminNamespace;

export type WaitlistNotificationsAdminKeys = Leaves<typeof adminKeys>;

export type WaitlistNotificationsAdminAllKeys = AllKeys<
  WaitlistNotificationsAdminNamespace,
  WaitlistNotificationsAdminKeys
>;
