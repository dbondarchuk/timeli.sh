import { EditorDocumentBlocksDictionary } from "@timelish/builder";
import { AllKeys, BuilderKeys } from "@timelish/i18n";
import { FileText } from "lucide-react";
import {
  BlogAdminKeys,
  BlogAdminNamespace,
} from "../translations/types";
import { BlogPostsListConfiguration } from "./posts-list/configuration";
import { BlogPostsListEditor } from "./posts-list/editor";
import {
  BlogPostsListPropsDefaults,
  BlogPostsListPropsSchema,
} from "./posts-list/schema";
import { BlogPostsListToolbar } from "./posts-list/toolbar";
import { BlogPostContentConfiguration } from "./post-content/configuration";
import { BlogPostContentEditor } from "./post-content/editor";
import {
  BlogPostContentPropsDefaults,
  BlogPostContentPropsSchema,
} from "./post-content/schema";
import { BlogPostContentToolbar } from "./post-content/toolbar";
import { BlogTagListConfiguration } from "./tag-list/configuration";
import { BlogTagListEditor } from "./tag-list/editor";
import {
  BlogTagListPropsDefaults,
  BlogTagListPropsSchema,
} from "./tag-list/schema";
import { BlogTagListToolbar } from "./tag-list/toolbar";

export const BlogBlocksSchema = {
  BlogPostsList: BlogPostsListPropsSchema,
  BlogPostContent: BlogPostContentPropsSchema,
  BlogTagList: BlogTagListPropsSchema,
};

export const BlogBlocksAllowedInFooter = {
  BlogPostsList: false,
  BlogPostContent: false,
  BlogTagList: false,
};

export const BlogEditors: EditorDocumentBlocksDictionary<
  typeof BlogBlocksSchema
> = {
  BlogPostsList: {
    displayName:
      "app_blog_admin.block.postsList.displayName" satisfies AllKeys<
        BlogAdminNamespace,
        BlogAdminKeys
      >,
    icon: <FileText className="text-primary" />,
    Editor: BlogPostsListEditor,
    Configuration: BlogPostsListConfiguration,
    Toolbar: BlogPostsListToolbar,
    defaultValue: BlogPostsListPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.content" satisfies AllKeys<
      "builder",
      BuilderKeys
    >,
  },
  BlogPostContent: {
    displayName:
      "app_blog_admin.block.postContent.displayName" satisfies AllKeys<
        BlogAdminNamespace,
        BlogAdminKeys
      >,
    icon: <FileText className="text-primary" />,
    Editor: BlogPostContentEditor,
    Configuration: BlogPostContentConfiguration,
    Toolbar: BlogPostContentToolbar,
    defaultValue: BlogPostContentPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.content" satisfies AllKeys<
      "builder",
      BuilderKeys
    >,
  },
  BlogTagList: {
    displayName:
      "app_blog_admin.block.tagList.displayName" satisfies AllKeys<
        BlogAdminNamespace,
        BlogAdminKeys
      >,
    icon: <FileText className="text-primary" />,
    Editor: BlogTagListEditor,
    Configuration: BlogTagListConfiguration,
    Toolbar: BlogTagListToolbar,
    defaultValue: BlogTagListPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.content" satisfies AllKeys<
      "builder",
      BuilderKeys
    >,
  },
};

export const BlogBlocks = Object.fromEntries(
  Object.entries(BlogBlocksSchema).map(([key, schema]) => [
    key,
    {
      schema,
      editor: BlogEditors[key as keyof typeof BlogBlocksSchema],
      allowedInFooter:
        BlogBlocksAllowedInFooter[key as keyof typeof BlogBlocksSchema],
    },
  ]),
);

