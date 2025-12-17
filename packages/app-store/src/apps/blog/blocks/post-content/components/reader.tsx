"use client";

import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import { cn, Skeleton } from "@timelish/ui";
import { useEffect, useState } from "react";
import { BlogPost, GetBlogPostActionType } from "../../../models";
import {
  BlogPublicKeys,
  BlogPublicNamespace,
} from "../../../translations/types";
import { blogPostsListFixtures } from "../../fixtures";
import { BlogPostContent } from "./post-content";

export const BlogPostContentReaderComponent: React.FC<
  {
    className?: string;
    id?: string;
    appId?: string;
    args?: Record<string, any>;
    paramKey: string;
    isEditor?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, id, appId, args, paramKey, isEditor, ...rest }) => {
  const t = useI18n<BlogPublicNamespace, BlogPublicKeys>("app_blog_public");
  const [post, setPost] = useState<BlogPost | null>(
    isEditor ? blogPostsListFixtures[0] : null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appId || isEditor) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const paramValue = args?.params?.[paramKey];
        if (!paramValue) {
          setLoading(false);
          return;
        }

        const result = await adminApi.apps.processRequest(appId, {
          type: GetBlogPostActionType,
          id: paramKey === "postId" ? paramValue : undefined,
          slug: paramKey === "slug" ? paramValue : undefined,
        });

        setPost(result);
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [appId, args?.params, paramKey, isEditor]);

  if (loading) {
    return <Skeleton className="w-full h-40" id={id} />;
  }

  if (!post) {
    return (
      <div className={cn(className)} id={id}>
        <p>{t("block.postContent.notFound")}</p>
      </div>
    );
  }

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
