"use client";

import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import { cn, Skeleton } from "@timelish/ui";
import { useEffect, useState } from "react";
import { BlogPost, GetBlogPostsActionType } from "../../../models";
import {
  BlogPublicKeys,
  BlogPublicNamespace,
} from "../../../translations/types";
import { blogPostsListFixtures } from "../../fixtures";
import { BlogPostsList } from "./posts-list";

export const BlogPostsListReaderComponent: React.FC<
  {
    appId?: string;
    isEditor?: boolean;
    args?: Record<string, any>;
    postsPerPage: number;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ appId, className, id, args, postsPerPage, isEditor, ...rest }) => {
  const t = useI18n<BlogPublicNamespace, BlogPublicKeys>("app_blog_public");
  const [posts, setPosts] = useState<BlogPost[]>(
    isEditor ? blogPostsListFixtures : [],
  );
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const page = args?.searchParams?.page ? Number(args.searchParams.page) : 0;
  const tag = args?.searchParams?.tag;

  useEffect(() => {
    if (!appId || isEditor) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const result = await adminApi.apps.processRequest(appId, {
          type: GetBlogPostsActionType,
          query: {
            offset: page * postsPerPage,
            limit: postsPerPage,
            isPublished: true,
            tag: tag || undefined,
            sort: [{ id: "publicationDate", desc: true }],
          },
        });

        setPosts(result.items || []);
        setTotal(result.total || 0);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [appId, page, postsPerPage, tag, isEditor]);

  if (!appId) return null;

  if (loading) {
    return (
      <div className={cn(className)} id={id}>
        <div className="grid gap-4 post-list">
          {Array.from({ length: postsPerPage }).map((_, index) => (
            <div key={index} className="border rounded p-4 post-item">
              <div className="text-xl font-semibold mb-2 post-item-title">
                <Skeleton className="w-full h-4" />
              </div>
              <div className="text-sm text-muted-foreground mb-2 post-item-date">
                <Skeleton className="w-full h-4" />
              </div>
              <div className="prose max-w-none post-item-content">
                <Skeleton className="w-full h-4" />
              </div>
              <div className="flex flex-wrap gap-2 mt-4 post-item-tags">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="w-full h-4" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={cn(className)} id={id}>
        <div>{t("block.postsList.noPosts")}</div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / postsPerPage);
  const hasPrevious = page > 0;
  const hasNext = page < totalPages - 1;

  return (
    <BlogPostsList
      appId={appId}
      page={page}
      tag={tag}
      posts={posts}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      previousText={t("block.postsList.previous")}
      nextText={t("block.postsList.next")}
      className={className}
      id={id}
      {...rest}
    />
  );
};
