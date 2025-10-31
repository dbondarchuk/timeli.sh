import * as z from "zod";
import { parseTime, zUniqueArray } from "../../utils";

export const timeSchema = z.string().refine((x) => {
  try {
    const result = parseTime(x);
    return (
      result.hour >= 0 &&
      result.hour <= 23 &&
      result.minute >= 0 &&
      result.minute <= 59
    );
  } catch {
    return false;
  }
}, "configuration.schedule.shifts.time.invalid");

export const shiftsSchema = zUniqueArray(
  z.array(
    z.object({
      weekDay: z
        .number()
        .min(1, "configuration.schedule.shifts.weekDay.min")
        .max(7, "configuration.schedule.shifts.weekDay.max"),
      shifts: z.array(
        z.object({
          start: timeSchema,
          end: timeSchema,
        }),
      ),
    }),
  ),
  (obj) => obj.weekDay,
);
