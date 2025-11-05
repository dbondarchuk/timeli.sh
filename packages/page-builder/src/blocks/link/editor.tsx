"use client";

import {
  EditorBlock,
  useBlockChildrenBlockIds,
  useBlockEditor,
  useCurrentBlock,
} from "@timelish/builder";
import { BlockStyle, useClassName } from "@timelish/page-builder-base";
import { cn } from "@timelish/ui";
import { LinkProps } from "./schema";
import { styles } from "./styles";
import { getDefaults } from "./styles.default";

const disable = {
  disableMove: true,
  disableDelete: true,
  disableClone: true,
  disableDrag: true,
};

export const LinkEditor = ({ props, style }: LinkProps) => {
  const currentBlock = useCurrentBlock<LinkProps>();
  const contentId = useBlockChildrenBlockIds(currentBlock.id, "props")?.[0];
  const base = currentBlock.base;
  const overlayProps = useBlockEditor(currentBlock.id);

  const className = useClassName();
  const defaults = getDefaults({ props, style }, true);

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        defaults={defaults}
        isEditor
      />
      <span
        className={cn(className, base?.className)}
        id={base?.id}
        {...overlayProps}
      >
        {!!contentId && (
          <EditorBlock
            key={contentId}
            blockId={contentId}
            {...disable}
            index={0}
            parentBlockId={currentBlock.id}
            parentProperty="content"
            allowedTypes="InlineContainer"
          />
        )}
      </span>
    </>
  );
};
