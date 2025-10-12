import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { CALENDAR_WRITER_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type CalendarWriterAdminKeys = Leaves<typeof adminKeys>;
export const calendarWriterAdminNamespace =
  `app_${CALENDAR_WRITER_APP_NAME}_admin` as const;

export type CalendarWriterAdminNamespace = typeof calendarWriterAdminNamespace;
export type CalendarWriterAdminAllKeys = AllKeys<
  CalendarWriterAdminNamespace,
  CalendarWriterAdminKeys
>;
