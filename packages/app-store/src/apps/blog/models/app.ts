import { Query } from "@timelish/types";
import * as z from "zod";
import { BlogPostUpdateModel } from "./blog-post";

export const blogConfigurationSchema = z.object({});

export type BlogConfiguration = z.infer<typeof blogConfigurationSchema>;

export type GetBlogPostsAction = {
  query: Query & {
    tag?: string;
    isPublished?: boolean;
  };
};

export const GetBlogPostsActionType = "get-blog-posts" as const;

export type GetBlogPostAction = {
  id?: string;
  slug?: string;
};

export const GetBlogPostActionType = "get-blog-post" as const;

export type CreateBlogPostAction = {
  post: BlogPostUpdateModel;
};

export const CreateBlogPostActionType = "create-blog-post" as const;

export type UpdateBlogPostAction = {
  id: string;
  post: BlogPostUpdateModel;
};

export const UpdateBlogPostActionType = "update-blog-post" as const;

export type DeleteBlogPostAction = {
  id: string;
};

export const DeleteBlogPostActionType = "delete-blog-post" as const;

export type DeleteSelectedBlogPostsAction = {
  ids: string[];
};

export const DeleteSelectedBlogPostsActionType = "delete-blog-posts" as const;

export type CheckBlogPostSlugUniqueAction = {
  slug: string;
  id?: string;
};

export const CheckBlogPostSlugUniqueActionType =
  "check-blog-post-slug-unique" as const;

export type GetBlogTagsAction = {
  sortBy?: "alphabetical" | "count";
  sortOrder?: "asc" | "desc";
};

export const GetBlogTagsActionType = "get-blog-tags" as const;

export type SetConfigurationAction = {
  configuration: BlogConfiguration;
};

export const SetConfigurationActionType = "set-configuration" as const;

export type RequestAction =
  | ({
      type: typeof GetBlogPostsActionType;
    } & GetBlogPostsAction)
  | ({
      type: typeof GetBlogPostActionType;
    } & GetBlogPostAction)
  | ({
      type: typeof CreateBlogPostActionType;
    } & CreateBlogPostAction)
  | ({
      type: typeof UpdateBlogPostActionType;
    } & UpdateBlogPostAction)
  | ({
      type: typeof DeleteBlogPostActionType;
    } & DeleteBlogPostAction)
  | ({
      type: typeof DeleteSelectedBlogPostsActionType;
    } & DeleteSelectedBlogPostsAction)
  | ({
      type: typeof CheckBlogPostSlugUniqueActionType;
    } & CheckBlogPostSlugUniqueAction)
  | ({
      type: typeof GetBlogTagsActionType;
    } & GetBlogTagsAction)
  | ({
      type: typeof SetConfigurationActionType;
    } & SetConfigurationAction);
