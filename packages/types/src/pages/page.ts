import { languages } from "@vivid/i18n";
import * as z from "zod";
import { WithCompanyId, WithDatabaseId } from "../database";
import { Prettify } from "../utils";

export const pageTagSchema = z.string().min(3, "page.tag.min");

export const pageSchema = z.object({
  title: z.string("page.title.required").min(2, "page.title.required"),
  // content: z.string().min(1, "page.content.required"),
  content: z.any().optional(),
  slug: z
    .string()
    .min(1, { error: "page.slug.required" })
    .regex(/^[a-z0-9]+(?:[-\/][a-z0-9]+)*$/g, "page.slug.invalid"),
  description: z
    .string("page.description.required")
    .min(1, "page.description.required"),
  keywords: z.string("page.keywords.required").min(1, "page.keywords.required"),
  published: z.coerce.boolean<boolean>(),
  publishDate: z.coerce.date<Date>({ error: "page.publishDate.required" }),
  tags: z.array(pageTagSchema).optional(),
  language: z.enum(languages).optional().nullable(),
  doNotCombine: z
    .object({
      title: z.coerce.boolean<boolean>().optional(),
      description: z.coerce.boolean<boolean>().optional(),
      keywords: z.coerce.boolean<boolean>().optional(),
    })
    .optional(),
  fullWidth: z.coerce.boolean<boolean>().optional(),
  headerId: z.string().optional(),
  footerId: z.string().optional(),
});

export const getPageSchemaWithUniqueCheck = (
  uniqueSlugCheckFn: (slug: string, id?: string) => Promise<boolean>,
  message: string,
) => {
  return z.object({
    ...pageSchema.shape,
    slug: pageSchema.shape.slug.refine(uniqueSlugCheckFn, { message }),
  });
};

export type PageUpdateModel = z.infer<typeof pageSchema>;

export type Page = Prettify<
  WithCompanyId<WithDatabaseId<PageUpdateModel>> & {
    createdAt: Date;
    updatedAt: Date;
  }
>;

export type PageListModel = Omit<Page, "content">;
export type PageListModelWithUrl = PageListModel & {
  url: string;
};
