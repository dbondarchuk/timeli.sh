import * as z from "zod";

export const calendarSourceConfigurationSchema = z.object({
  appId: z.string().min(1, "configuration.booking.calendarSource.required"),
});

export type CalendarSourceConfiguration = z.infer<
  typeof calendarSourceConfigurationSchema
>;

export const calendarSourcesConfigurationSchema = z
  .array(calendarSourceConfigurationSchema)
  .optional();
export type CalendarSourcesConfiguration = z.infer<
  typeof calendarSourcesConfigurationSchema
>;
