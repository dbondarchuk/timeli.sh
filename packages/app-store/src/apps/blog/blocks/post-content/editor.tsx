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
import { resolveBlogPostDisplayContent } from "./resolve-display-content";
import { BlogPostContentProps, BlogPostContentPropsDefaults, styles } from "./schema";

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

  const blockProps = currentBlock?.data?.props;
  const showShort =
    blockProps?.showShort ?? BlogPostContentPropsDefaults.props.showShort;

  const displayContent = useMemo(() => {
    if (!postContent || showError) {
      return postContent;
    }
    return resolveBlogPostDisplayContent(postContent, blockProps);
  }, [postContent, blockProps, showError]);

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
