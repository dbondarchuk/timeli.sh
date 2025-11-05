import * as z from "zod";
import { shiftsSchema } from "./shifts";

export const scheduleOverrideSchema = z.object({
  week: z.coerce
    .number<number>()
    .int("configuration.schedule.override.week.integer")
    .positive("configuration.schedule.override.week.positive"),
  schedule: shiftsSchema,
});

export type ScheduleOverride = z.infer<typeof scheduleOverrideSchema>;
