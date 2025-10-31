import * as z from "zod";

export const sortOptionSchema = z.object({
  id: z.string().min(1),
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
