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
import {
  BlogPostContentPropsDefaults,
  BlogPostContentReaderProps,
  styles,
} from "./schema";

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

  const showShort =
    props?.showShort ?? BlogPostContentPropsDefaults.props.showShort;

  // Check if content is in PlateJS format (array) and get short version
  const displayContent = useMemo(() => {
    if (!postContent || showError) return postContent;

    if (showShort && Array.isArray(postContent) && postContent.length > 5) {
      // Return first 5 children for short content
      return postContent.slice(0, 5);
    }

    return postContent;
  }, [postContent, showShort, showError]);

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
            <PlateStaticEditor value={displayContent} />
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
