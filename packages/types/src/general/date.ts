import * as z from "zod";

export const dateRangeSchema = z.object({
  start: z.date().optional(),
  end: z.date().optional(),
});

export type DateRange = z.infer<typeof dateRangeSchema>;

/**
 * Sequential number of the week starting from January 5, 1970
 */
export const weekIdentifierSchema = z.number().int().positive();

/**
 * Sequential number of the week starting from January 5, 1970
 */
export type WeekIdentifier = number;
