import { AllKeys } from "@timelish/i18n";
import { Leaves } from "@timelish/types";
import { APPOINTMENT_NOTIFICATIONS_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type AppointmentNotificationsAdminKeys = Leaves<typeof adminKeys>;
export const appointmentNotificationsAdminNamespace =
  `app_${APPOINTMENT_NOTIFICATIONS_APP_NAME}_admin` as const;

export type AppointmentNotificationsAdminNamespace =
  typeof appointmentNotificationsAdminNamespace;
export type AppointmentNotificationsAdminAllKeys = AllKeys<
  AppointmentNotificationsAdminNamespace,
  AppointmentNotificationsAdminKeys
>;
