"use client";

import { cn } from "@timelish/ui";
import { BlogTagListReaderProps } from "../schema";

export const BlogTagListEditorComponent: React.FC<
  BlogTagListReaderProps & { isEditor?: boolean }
> = ({ className, id, isEditor, appId }) => {
  // In editor, show fixture data
  if (isEditor) {
    return (
      <div className={cn(className)} id={id}>
        <h3 className="font-semibold mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {["Technology", "Design", "Development", "Tutorial"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm bg-secondary rounded-md"
            >
              {tag} (5)
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(className)} id={id}>
      {/* Real implementation will fetch and display tags */}
      <p>Blog tag list (reader mode)</p>
    </div>
  );
};

