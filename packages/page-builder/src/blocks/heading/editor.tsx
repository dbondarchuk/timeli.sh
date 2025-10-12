"use client";

import {
  BaseBlockProps,
  EditorBlock,
  useBlockChildrenBlockIds,
  useBlockEditor,
  useCurrentBlockId,
} from "@vivid/builder";
import { BlockStyle, useClassName } from "@vivid/page-builder-base";
import { cn } from "@vivid/ui";
import { DefaultHeadingLevel, HeadingProps } from "./schema";
import { getDefaults, styles } from "./styles";

const disable = {
  disableMove: true,
  disableDelete: true,
  disableClone: true,
  disableDrag: true,
};

export function HeadingEditor({
  props,
  style,
  base,
}: HeadingProps & { base?: BaseBlockProps }) {
  const level = props?.level ?? DefaultHeadingLevel;

  const currentBlockId = useCurrentBlockId();
  const overlayProps = useBlockEditor(currentBlockId);
  const contentId = useBlockChildrenBlockIds(currentBlockId, "props")?.[0];

  const className = useClassName();
  const defaults = getDefaults(level);

  const Element = level;

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        defaults={defaults}
        isEditor
      />
      <Element
        className={cn(className, base?.className)}
        id={base?.id}
        {...overlayProps}
      >
        {!!contentId && (
          <EditorBlock
            key={contentId}
            blockId={contentId}
            index={0}
            {...disable}
            parentBlockId={currentBlockId}
            parentProperty="content"
            allowedTypes="InlineContainer"
          />
        )}
      </Element>
    </>
  );
}
