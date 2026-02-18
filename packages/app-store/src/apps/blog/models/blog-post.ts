import {
  Prettify,
  WithCompanyId,
  WithDatabaseId,
  zNonEmptyString,
  zUniqueArray,
} from "@timelish/types";
import * as z from "zod";
import { BlogAdminAllKeys } from "../translations/types";

export const blogPostTagSchema = zNonEmptyString(
  "app_blog_admin.validation.post.tag.min" satisfies BlogAdminAllKeys,
  2,
).max(64, "app_blog_admin.validation.post.tag.max" satisfies BlogAdminAllKeys);

export const blogPostSchema = z.object({
  title: zNonEmptyString(
    "app_blog_admin.validation.post.title.required" satisfies BlogAdminAllKeys,
    1,
  ).max(
    256,
    "app_blog_admin.validation.post.title.max" satisfies BlogAdminAllKeys,
  ),
  slug: zNonEmptyString(
    "app_blog_admin.validation.post.slug.required" satisfies BlogAdminAllKeys,
    1,
  )
    .max(
      256,
      "app_blog_admin.validation.post.slug.max" satisfies BlogAdminAllKeys,
    )
    .regex(
      /^(?:[a-z0-9-]+|\[(?:\.{3})?[a-zA-Z0-9_-]+\])(\/(?:[a-z0-9-]+|\[(?:\.{3})?[a-zA-Z0-9_-]+\]))*$/g,
      "app_blog_admin.validation.post.slug.pattern" satisfies BlogAdminAllKeys,
    ),
  content: z.any().optional(),
  isPublished: z.coerce.boolean<boolean>(),
  publicationDate: z.coerce.date<Date>(
    "app_blog_admin.validation.post.publicationDate.required" satisfies BlogAdminAllKeys,
  ),
  tags: zUniqueArray(
    z.array(blogPostTagSchema),
    (tag) => tag?.toLocaleLowerCase(),
    "app_blog_admin.validation.post.tag.unique" satisfies BlogAdminAllKeys,
  ).optional(),
});

export const getBlogPostSchemaWithUniqueCheck = (
  uniqueSlugCheckFn: (slug: string) => Promise<boolean>,
  message: string = "app_blog_admin.validation.post.slug.unique" satisfies BlogAdminAllKeys,
) => {
  return blogPostSchema.superRefine(async (args, ctx) => {
    const isUnique = await uniqueSlugCheckFn(args.slug);
    if (!isUnique) {
      ctx.addIssue({
        code: "custom",
        path: ["slug"],
        message,
      });
    }
  });
};

export type BlogPostUpdateModel = z.infer<typeof blogPostSchema>;

export type BlogPostEntity = WithCompanyId<
  WithDatabaseId<BlogPostUpdateModel>
> & {
  appId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogPost = Prettify<BlogPostEntity>;
