"use client";

import {
  EditorChildren,
  useBlockEditor,
  useCurrentBlock,
} from "@vivid/builder";
import { BlockStyle, useClassName } from "@vivid/page-builder-base";
import { cn } from "@vivid/ui";
import { useMemo } from "react";
import { AccordionProps } from "./schema";
import { styles } from "./styles";

export const AccordionEditor = ({ props, style }: AccordionProps) => {
  const currentBlock = useCurrentBlock<AccordionProps>();
  const overlayProps = useBlockEditor(currentBlock.id);
  const className = useClassName();
  const base = currentBlock.base;

  const animation = currentBlock.data?.props?.animation;
  const iconPosition = currentBlock.data?.props?.iconPosition;
  const iconStyle = currentBlock.data?.props?.iconStyle;

  // Pass animation properties to accordion items
  const additionalProps = useMemo(
    () => ({
      animation,
      iconPosition,
      iconStyle,
    }),
    [animation, iconPosition, iconStyle],
  );

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={currentBlock.data?.style}
      />
      <div
        className={cn(className, base?.className)}
        id={base?.id}
        {...overlayProps}
      >
        <EditorChildren
          blockId={currentBlock.id}
          property="props"
          allowOnly="AccordionItem"
          additionalProps={additionalProps}
        />
      </div>
    </>
  );
};
