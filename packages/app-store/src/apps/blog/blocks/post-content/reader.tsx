import { I18nText } from "@timelish/i18n";
import {
  BlockStyle,
  generateClassName,
  ReplaceOriginalColors,
} from "@timelish/page-builder-base/reader";
import { PlateStaticEditor } from "@timelish/rte";
import { cn } from "@timelish/ui";
import { useMemo } from "react";
import { BlogPublicAllKeys } from "../../translations/types";
import { resolveBlogPostDisplayContent } from "./resolve-display-content";
import { BlogPostContentReaderProps, styles } from "./schema";

export const BlogPostContentReader = ({
  props,
  style,
  block,
  args,
  isEditor,
}: BlogPostContentReaderProps) => {
  // Get content from args.post.content
  const postContent = args?.post?.content;
  const showError = !postContent;

  const showShort = props?.showShort ?? false;

  const displayContent = useMemo(() => {
    if (!postContent || showError) {
      return postContent;
    }
    return resolveBlogPostDisplayContent(postContent, props);
  }, [postContent, props, showError]);

  const className = generateClassName();
  const base = block.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <div className={cn(className, base?.className)} id={base?.id}>
        {isEditor && <ReplaceOriginalColors />}
        {showError ? (
          <span>
            <I18nText
              text={
                "app_blog_public.notInBlogContext" satisfies BlogPublicAllKeys
              }
            />
          </span>
        ) : (
          <>
            <PlateStaticEditor
              value={displayContent}
              // renderMode={
              //   !isEditor && !showShort ? "fast" : "plate"
              // }
            />
            {showShort && (
              <a
                href={args?.postLink || "#"}
                className="mt-2 inline-block text-primary underline read-more"
              >
                <I18nText
                  text={"app_blog_public.readMore" satisfies BlogPublicAllKeys}
                />
              </a>
            )}
          </>
        )}
      </div>
    </>
  );
};
