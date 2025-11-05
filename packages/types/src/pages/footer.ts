import * as z from "zod";
import { WithCompanyId, WithDatabaseId } from "../database";
import { Prettify } from "../utils";

export const pageFooterSchema = z.object({
  name: z
    .string({ error: "page.footers.name.required" })
    .min(2, "page.footers.name.min"),
  content: z.any().optional(),
});

export const getPageFooterSchemaWithUniqueNameCheck = (
  uniqueNameCheckFn: (name: string, id?: string) => Promise<boolean>,
  message: string,
) => {
  return z.object({
    ...pageFooterSchema.shape,
    name: pageFooterSchema.shape.name.refine(uniqueNameCheckFn, { message }),
  });
};

export type PageFooterUpdateModel = z.infer<typeof pageFooterSchema>;

export type PageFooter = Prettify<
  WithCompanyId<WithDatabaseId<PageFooterUpdateModel>> & {
    updatedAt: Date;
  }
>;

export type PageFooterListModel = Omit<PageFooter, "content"> & {
  usedCount: number;
};
