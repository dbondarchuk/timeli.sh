import * as z from "zod";
import { zNonEmptyString } from "../utils";

export const sortOptionSchema = z.object({
  id: zNonEmptyString("ID is required"),
  desc: z.coerce
    .boolean<boolean>()
    .optional()
    .transform((d) => (typeof d === "undefined" ? false : d)),
});

export type SortOption = z.infer<typeof sortOptionSchema>;

export const sortSchema = z.array(sortOptionSchema);
export type Sort = z.infer<typeof sortSchema>;

export const querySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number<number>().optional(),
  offset: z.coerce.number<number>().optional(),
  sort: sortSchema.optional(),
});

export type Query = z.infer<typeof querySchema>;
