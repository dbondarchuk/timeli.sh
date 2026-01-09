"use client";

import { BlogPostForm } from "../form";

export const BlogNewPage = ({ appId }: { appId: string }) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <BlogPostForm appId={appId} />
    </div>
  );
};
