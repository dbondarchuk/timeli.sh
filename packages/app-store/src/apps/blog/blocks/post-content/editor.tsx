"use client";

import {
  useBlockEditor,
  useCurrentBlock,
  useEditorArgs,
} from "@timelish/builder";
import { useI18n } from "@timelish/i18n";
import {
  BlockStyle,
  ReplaceOriginalColors,
  useClassName,
} from "@timelish/page-builder-base";
import { PlateStaticEditor } from "@timelish/rte";
import { cn } from "@timelish/ui";
import { useMemo } from "react";
import {
  BlogPublicKeys,
  BlogPublicNamespace,
  blogPublicNamespace,
} from "../../translations/types";
import {
  BlogPostContentProps,
  BlogPostContentPropsDefaults,
  styles,
} from "./schema";

export const BlogPostContentEditor = ({
  props,
  style,
}: BlogPostContentProps) => {
  const currentBlock = useCurrentBlock<BlogPostContentProps>();
  const overlayProps = useBlockEditor(currentBlock.id);
  const args = useEditorArgs();
  const t = useI18n<BlogPublicNamespace, BlogPublicKeys>(blogPublicNamespace);

  // Get content from args.post.content
  const postContent = args?.post?.content;
  const showError = !postContent;

  const showShort =
    currentBlock?.data?.props?.showShort ??
    BlogPostContentPropsDefaults.props.showShort;

  // Check if content is in PlateJS format (array) and get short version
  const displayContent = useMemo(() => {
    if (!postContent || showError) return postContent;

    if (showShort && Array.isArray(postContent) && postContent.length > 5) {
      // Return first 5 children for short content
      return postContent.slice(0, 5);
    }

    return postContent;
  }, [postContent, showShort, showError]);

  const className = useClassName();
  const base = currentBlock?.base;

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        isEditor
      />
      <div
        className={cn(className, base?.className)}
        id={base?.id}
        {...overlayProps}
      >
        <ReplaceOriginalColors />
        {showError ? (
          <span>{t("notInBlogContext")}</span>
        ) : (
          <>
            <PlateStaticEditor value={displayContent} />
            {showShort && (
              <a
                href="#"
                className="mt-2 inline-block text-primary underline read-more"
              >
                {t("readMore")}
              </a>
            )}
          </>
        )}
      </div>
    </>
  );
};
