"use client";

import { useI18n } from "@timelish/i18n";
import { cn } from "@timelish/ui";
import { adminApi } from "@timelish/api-sdk";
import { GetBlogTagsActionType } from "../../../models";
import { BlogPublicNamespace, BlogPublicKeys } from "../../../translations/types";
import { useEffect, useState } from "react";
import Link from "next/link";

export const BlogTagListReaderComponent: React.FC<{
  className?: string;
  id?: string;
  appId?: string;
  props: { sortBy: "alphabetical" | "count"; sortOrder: "asc" | "desc" };
}> = ({ className, id, appId, props }) => {
  const t = useI18n<BlogPublicNamespace, BlogPublicKeys>("app_blog_public");
  const [tags, setTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appId) return;

    const fetchTags = async () => {
      try {
        setLoading(true);
        const result = await adminApi.apps.processRequest(appId, {
          type: GetBlogTagsActionType,
          sortBy: props.sortBy,
          sortOrder: props.sortOrder,
        });

        setTags(result || []);
      } catch (error) {
        console.error("Error fetching blog tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [appId, props.sortBy, props.sortOrder]);

  if (loading) {
    return <div className={cn(className)} id={id}>Loading...</div>;
  }

  if (tags.length === 0) {
    return (
      <div className={cn(className)} id={id}>
        <p>{t("block.tagList.noTags")}</p>
      </div>
    );
  }

  return (
    <div className={cn(className)} id={id}>
      <h3 className="font-semibold mb-4">{t("block.tagList.title")}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`?tag=${encodeURIComponent(tag)}`}
            className="px-3 py-1 text-sm bg-secondary rounded-md hover:bg-secondary/80"
          >
            {tag} ({count})
          </Link>
        ))}
      </div>
    </div>
  );
};

