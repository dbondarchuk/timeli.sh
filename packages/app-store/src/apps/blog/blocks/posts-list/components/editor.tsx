"use client";

import { useI18n } from "@timelish/i18n";
import {
  BlogPublicKeys,
  BlogPublicNamespace,
} from "../../../translations/types";
import { blogPostsListFixtures } from "../../fixtures";
import { BlogPostsList } from "./posts-list";

export const BlogPostsListEditorComponent: React.FC<
  {
    appId?: string;
    args?: Record<string, any>;
    postsPerPage: number;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ appId, args, postsPerPage, ...rest }) => {
  const t = useI18n<BlogPublicNamespace, BlogPublicKeys>("app_blog_public");
  const posts = blogPostsListFixtures.slice(0, postsPerPage);

  if (!appId) return null;
  const page = 1;
  const tag = "";

  return (
    <BlogPostsList
      appId={appId}
      page={page}
      tag={tag}
      posts={posts}
      hasPrevious
      hasNext
      isEditor
      previousText={t("block.postsList.previous")}
      nextText={t("block.postsList.next")}
      {...rest}
    />
  );
};
