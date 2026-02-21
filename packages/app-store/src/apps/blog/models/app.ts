import { querySchema, zObjectId, zTaggedUnion } from "@timelish/types";
import * as z from "zod";
import { blogPostSchema } from "./blog-post";

export const blogConfigurationSchema = z.object({});

export type BlogConfiguration = z.infer<typeof blogConfigurationSchema>;

// Get Blog Posts Action

export const getBlogPostsActionSchema = z.object({
  query: querySchema.extend({
    tag: z.string().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export type GetBlogPostsAction = z.infer<typeof getBlogPostsActionSchema>;
export const GetBlogPostsActionType = "get-blog-posts" as const;

// Get Blog Post Action

export const getBlogPostActionSchema = z
  .object({
    id: zObjectId().optional(),
    slug: z.string().optional(),
  })
  .refine((data) => data.id || data.slug, {
    path: ["id", "slug"],
    message: "id_or_slug_required",
  });

export type GetBlogPostAction = z.infer<typeof getBlogPostActionSchema>;
export const GetBlogPostActionType = "get-blog-post" as const;

// Create Blog Post Action

export const createBlogPostActionSchema = z.object({
  post: blogPostSchema,
});

export type CreateBlogPostAction = z.infer<typeof createBlogPostActionSchema>;
export const CreateBlogPostActionType = "create-blog-post" as const;

// Update Blog Post Action

export const updateBlogPostActionSchema = z.object({
  id: zObjectId(),
  post: blogPostSchema,
});

export type UpdateBlogPostAction = z.infer<typeof updateBlogPostActionSchema>;
export const UpdateBlogPostActionType = "update-blog-post" as const;

// Delete Blog Post Action

export const deleteBlogPostActionSchema = z.object({
  id: zObjectId(),
});

export type DeleteBlogPostAction = z.infer<typeof deleteBlogPostActionSchema>;
export const DeleteBlogPostActionType = "delete-blog-post" as const;

// Delete Selected Blog Posts Action
export const deleteSelectedBlogPostsActionSchema = z.object({
  ids: z.array(zObjectId()),
});

export type DeleteSelectedBlogPostsAction = z.infer<
  typeof deleteSelectedBlogPostsActionSchema
>;
export const DeleteSelectedBlogPostsActionType = "delete-blog-posts" as const;

// Check Blog Post Slug Unique Action

export const checkBlogPostSlugUniqueActionSchema = z.object({
  slug: z.string().min(1, "slug_required"),
  id: zObjectId().optional(),
});

export type CheckBlogPostSlugUniqueAction = z.infer<
  typeof checkBlogPostSlugUniqueActionSchema
>;
export const CheckBlogPostSlugUniqueActionType =
  "check-blog-post-slug-unique" as const;

// Get Blog Tags Action

export const getBlogTagsActionSchema = z.object({
  sortBy: z.enum(["alphabetical", "count"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetBlogTagsAction = z.infer<typeof getBlogTagsActionSchema>;
export const GetBlogTagsActionType = "get-blog-tags" as const;

// Set Configuration Action

export const setConfigurationActionSchema = z.object({
  configuration: blogConfigurationSchema,
});

export type SetConfigurationAction = z.infer<
  typeof setConfigurationActionSchema
>;
export const SetConfigurationActionType = "set-configuration" as const;

// Request Action
// export const requestActionSchema = z
//   .object({
//     type: z.literal(GetBlogPostsActionType),
//     data: getBlogPostsActionSchema,
//   })
//   .or(
//     z.object({
//       type: z.literal(GetBlogPostActionType),
//       data: getBlogPostActionSchema,
//     }),
//   )
//   .or(
//     z.object({
//       type: z.literal(CreateBlogPostActionType),
//       data: createBlogPostActionSchema,
//     }),
//   )
//   .or(
//     z.object({
//       type: z.literal(UpdateBlogPostActionType),
//       data: updateBlogPostActionSchema,
//     }),
//   )
//   .or(
//     z.object({
//       type: z.literal(DeleteBlogPostActionType),
//       data: deleteBlogPostActionSchema,
//     }),
//   )
//   .or(
//     z.object({
//       type: z.literal(DeleteSelectedBlogPostsActionType),
//       data: deleteSelectedBlogPostsActionSchema,
//     }),
//   )
//   .or(
//     z.object({
//       type: z.literal(CheckBlogPostSlugUniqueActionType),
//       data: checkBlogPostSlugUniqueActionSchema,
//     }),
//   )
//   .or(
//     z.object({
//       type: z.literal(GetBlogTagsActionType),
//       data: getBlogTagsActionSchema,
//     }),
//   )
//   .or(
//     z.object({
//       type: z.literal(SetConfigurationActionType),
//       data: setConfigurationActionSchema,
//     }),
//   );

export const requestActionSchema = zTaggedUnion([
  { type: GetBlogPostsActionType, data: getBlogPostsActionSchema },
  { type: GetBlogPostActionType, data: getBlogPostActionSchema },
  { type: CreateBlogPostActionType, data: createBlogPostActionSchema },
  { type: UpdateBlogPostActionType, data: updateBlogPostActionSchema },
  { type: DeleteBlogPostActionType, data: deleteBlogPostActionSchema },
  {
    type: DeleteSelectedBlogPostsActionType,
    data: deleteSelectedBlogPostsActionSchema,
  },
  {
    type: CheckBlogPostSlugUniqueActionType,
    data: checkBlogPostSlugUniqueActionSchema,
  },
  { type: GetBlogTagsActionType, data: getBlogTagsActionSchema },
  { type: SetConfigurationActionType, data: setConfigurationActionSchema },
]);

export type RequestAction = z.infer<typeof requestActionSchema>;
