"use client";

import { useBlockEditor, useCurrentBlock } from "@timelish/builder";
import {
  BlockStyle,
  ReplaceOriginalColors,
  useClassName,
} from "@timelish/page-builder-base";
import { cn } from "@timelish/ui";
import { BlogPostContentEditorComponent } from "./components/editor";
import { BlogPostContentProps } from "./schema";
import { styles } from "./styles";

export const BlogPostContentEditor = ({
  props,
  style,
  appId,
}: BlogPostContentProps & { appId?: string }) => {
  const currentBlock = useCurrentBlock<BlogPostContentProps>();
  const overlayProps = useBlockEditor(currentBlock.id);

  const className = useClassName();
  const base = currentBlock.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <ReplaceOriginalColors />
      <BlogPostContentEditorComponent
        className={cn(className, base?.className)}
        id={base?.id}
        appId={appId}
        {...overlayProps}
      />
    </>
  );
};
