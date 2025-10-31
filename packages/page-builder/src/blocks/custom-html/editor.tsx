"use client";

import { useBlockEditor, useCurrentBlock } from "@vivid/builder";
import { BlockStyle, useClassName } from "@vivid/page-builder-base";
import { cn } from "@vivid/ui";
import { CustomHTMLProps } from "./schema";
import { styles } from "./styles";
import { getDefaults } from "./styles.default";

export const CustomHTMLEditor = ({ props, style }: CustomHTMLProps) => {
  const currentBlock = useCurrentBlock<CustomHTMLProps>();
  const overlayProps = useBlockEditor(currentBlock.id);
  const html = (currentBlock?.data?.props as any)?.html ?? "";
  const base = currentBlock?.base;

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

      <div
        className={cn(className, base?.className)}
        id={base?.id}
        {...overlayProps}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
};
