"use client";

import { useBlockEditor, useCurrentBlock } from "@timelish/builder";
import {
  BlockStyle,
  ReplaceOriginalColors,
  useClassName,
} from "@timelish/page-builder-base";
import { cn } from "@timelish/ui";
import { BlogPostsListEditorComponent } from "./components/editor";
import { BlogPostsListProps } from "./schema";
import { styles } from "./styles";

export const BlogPostsListEditor = ({
  props,
  style,
  appId,
}: BlogPostsListProps & { appId?: string }) => {
  const currentBlock = useCurrentBlock<BlogPostsListProps>();
  const overlayProps = useBlockEditor(currentBlock.id);

  const className = useClassName();
  const base = currentBlock.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <ReplaceOriginalColors />
      <BlogPostsListEditorComponent
        className={cn(className, base?.className)}
        id={base?.id}
        appId={appId}
        postsPerPage={props.postsPerPage}
        {...overlayProps}
      />
    </>
  );
};
