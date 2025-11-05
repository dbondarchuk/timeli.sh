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

export type Query = {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: Sort;
};
