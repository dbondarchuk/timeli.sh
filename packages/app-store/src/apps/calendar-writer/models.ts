import { zNonEmptyString } from "@timelish/types";
import * as z from "zod";
import { CalendarWriterAdminAllKeys } from "./translations/types";

export const calendarWriterConfigurationSchema = z.object({
  appId: zNonEmptyString(
    "app_calendar-writer_admin.validation.appId.required" satisfies CalendarWriterAdminAllKeys,
  ),
});

export type CalendarWriterConfiguration = z.infer<
  typeof calendarWriterConfigurationSchema
>;
