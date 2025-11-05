import { AllKeys } from "@timelish/i18n";
import { Leaves } from "@timelish/types";
import { GOOGLE_CALENDAR_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type GoogleCalendarAdminKeys = Leaves<typeof admin>;
export const googleCalendarAdminNamespace =
  `app_${GOOGLE_CALENDAR_APP_NAME}_admin` as const;

export type GoogleCalendarAdminNamespace = typeof googleCalendarAdminNamespace;

export type GoogleCalendarAdminAllKeys = AllKeys<
  GoogleCalendarAdminNamespace,
  GoogleCalendarAdminKeys
>;
