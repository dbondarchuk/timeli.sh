"use client";

import { useI18n } from "@timelish/i18n";
import {
  BlogPublicKeys,
  BlogPublicNamespace,
} from "../../../translations/types";
import { blogPostsListFixtures } from "../../fixtures";
import { BlogPostContent } from "./post-content";

export const BlogPostContentEditorComponent: React.FC<
  {
    className?: string;
    id?: string;
    appId?: string;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, id, appId, ...rest }) => {
  const t = useI18n<BlogPublicNamespace, BlogPublicKeys>("app_blog_public");

  const post = blogPostsListFixtures[0];

  return (
    <BlogPostContent
      appId={appId}
      post={post}
      publishedOnText={t("block.postContent.publishedOn")}
      className={className}
      id={id}
      {...rest}
    />
  );
};
