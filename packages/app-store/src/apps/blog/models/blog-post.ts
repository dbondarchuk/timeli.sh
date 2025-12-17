import {
  Prettify,
  WithCompanyId,
  WithDatabaseId,
  zNonEmptyString,
} from "@timelish/types";
import * as z from "zod";
import { BlogPublicAllKeys } from "../translations/types";

export const blogPostTagSchema = zNonEmptyString(
  "app_blog_public.block.post.tag.min" satisfies BlogPublicAllKeys,
  2,
);

export const blogPostSchema = z.object({
  title: zNonEmptyString(
    "app_blog_public.block.post.title.required" satisfies BlogPublicAllKeys,
    1,
  ),
  slug: zNonEmptyString(
    "app_blog_public.block.post.slug.required" satisfies BlogPublicAllKeys,
    1,
  ),
  content: z.any().optional(),
  isPublished: z.coerce.boolean<boolean>(),
  publicationDate: z.coerce.date<Date>(),
  tags: z.array(blogPostTagSchema).optional(),
});

export type BlogPostUpdateModel = z.infer<typeof blogPostSchema>;

export type BlogPostEntity = WithCompanyId<
  WithDatabaseId<BlogPostUpdateModel>
> & {
  appId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogPost = Prettify<BlogPostEntity>;
