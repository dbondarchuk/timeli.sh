import { languages } from "@vivid/i18n";
import { z } from "zod";
import { WithDatabaseId } from "../database";

export const pageTagSchema = z.string().min(3, "page.tag.min");

export const pageSchema = z.object({
  title: z.string().min(2, "page.title.required"),
  // content: z.string().min(1, "page.content.required"),
  content: z.any().optional(),
  slug: z
    .string()
    .min(1, { message: "page.slug.required" })
    .regex(/^[a-z0-9]+(?:[-\/][a-z0-9]+)*$/g, "page.slug.invalid"),
  description: z.string().min(1, "page.description.required"),
  keywords: z.string().min(1, "page.keywords.required"),
  published: z.coerce.boolean().default(false),
  publishDate: z.coerce.date({ required_error: "page.publishDate.required" }),
  tags: z.array(pageTagSchema).optional(),
  language: z.enum(languages).optional().nullable(),
  doNotCombine: z
    .object({
      title: z.coerce.boolean().optional(),
      description: z.coerce.boolean().optional(),
      keywords: z.coerce.boolean().optional(),
    })
    .optional(),
  fullWidth: z.coerce.boolean().optional(),
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

export type Page = WithDatabaseId<PageUpdateModel> & {
  createdAt: Date;
  updatedAt: Date;
};

export type PageListModel = Omit<Page, "content">;
export type PageListModelWithUrl = PageListModel & {
  url: string;
};
