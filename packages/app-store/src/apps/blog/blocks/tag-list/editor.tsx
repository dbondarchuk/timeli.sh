"use client";

import { useBlockEditor, useCurrentBlock } from "@timelish/builder";
import {
  BlockStyle,
  ReplaceOriginalColors,
  useClassName,
} from "@timelish/page-builder-base";
import { cn } from "@timelish/ui";
import { BlogTagListProps } from "./schema";
import { styles } from "./styles";
import { BlogTagListEditorComponent } from "./components/tag-list";

export const BlogTagListEditor = ({
  props,
  style,
  appId,
}: BlogTagListProps & { appId?: string }) => {
  const currentBlock = useCurrentBlock<BlogTagListProps>();
  const overlayProps = useBlockEditor(currentBlock.id);

  const className = useClassName();
  const base = currentBlock.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <ReplaceOriginalColors />
      <BlogTagListEditorComponent
        className={cn(className, base?.className)}
        id={base?.id}
        isEditor
        appId={appId}
        {...overlayProps}
      />
    </>
  );
};

