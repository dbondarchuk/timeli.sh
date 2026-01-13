"use client";

import {
  BaseBlockProps,
  BlockFilterRule,
  EditorChildren,
  useBlockEditor,
  useCurrentBlockId,
} from "@timelish/builder";
import { BlockStyle, useClassName } from "@timelish/page-builder-base";
import { cn } from "@timelish/ui";
import { DefaultHeadingLevel, HeadingProps } from "./schema";
import { styles } from "./styles";
import { getDefaults } from "./styles.default";

const allowOnly: BlockFilterRule = {
  capabilities: ["inline"],
};

export function HeadingEditor({
  props,
  style,
  base,
}: HeadingProps & { base?: BaseBlockProps }) {
  const level = props?.level ?? DefaultHeadingLevel;

  const currentBlockId = useCurrentBlockId();
  const overlayProps = useBlockEditor(currentBlockId);

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
        <EditorChildren
          blockId={currentBlockId}
          property="props"
          allow={allowOnly}
        />
      </Element>
    </>
  );
}
