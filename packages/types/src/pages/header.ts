import * as z from "zod";
import { menuItemsWithSubMenuSchema } from "../configuration/styling/menu-item";
import { WithCompanyId, WithDatabaseId } from "../database";
import { Prettify } from "../utils";

export const pageHeaderShadowType = ["none", "static", "on-scroll"] as const;

export const pageHeaderSchema = z.object({
  name: z.string("page.headers.name.min").min(2, "page.headers.name.min"),
  menu: menuItemsWithSubMenuSchema,
  showLogo: z.coerce.boolean<boolean>().default(false).optional(),
  sticky: z.coerce.boolean<boolean>().default(false).optional(),
  shadow: z.enum(pageHeaderShadowType).optional(),
});

export const getPageHeaderSchemaWithUniqueNameCheck = (
  uniqueNameCheckFn: (name: string, id?: string) => Promise<boolean>,
  message: string,
) => {
  return z.object({
    ...pageHeaderSchema.shape,
    name: pageHeaderSchema.shape.name.refine(uniqueNameCheckFn, { message }),
  });
};

export type PageHeaderUpdateModel = z.infer<typeof pageHeaderSchema>;

export type PageHeader = Prettify<
  WithCompanyId<WithDatabaseId<PageHeaderUpdateModel>> & {
    updatedAt: Date;
  }
>;

export type PageHeaderListModel = Omit<PageHeader, "menu"> & {
  usedCount: number;
};
