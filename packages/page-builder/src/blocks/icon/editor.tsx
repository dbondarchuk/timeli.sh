"use client";

import { useBlockEditor, useCurrentBlock } from "@vivid/builder";
import {
  BlockStyle,
  useClassName,
  useResizeBlockStyles,
} from "@vivid/page-builder-base";
import { cn } from "@vivid/ui";
import { icons } from "lucide-react";
import { Ref } from "react";
import { IconProps } from "./schema";
import { getDefaults, styles } from "./styles";

export const IconEditor = ({ props, style }: IconProps) => {
  const currentBlock = useCurrentBlock<IconProps>();
  const onResize = useResizeBlockStyles();
  const overlayProps = useBlockEditor(currentBlock.id, onResize);

  const iconName = (currentBlock?.data?.props as any)?.icon ?? "Star";
  const base = currentBlock?.base;

  const className = useClassName();
  const defaults = getDefaults({ props, style }, true);

  // Get the icon component from Lucide
  const IconComponent = icons[iconName as keyof typeof icons];

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        defaults={defaults}
        isEditor
      />

      <IconComponent
        className={cn(className, base?.className)}
        id={base?.id}
        onClick={overlayProps.onClick}
        ref={overlayProps.ref as Ref<SVGSVGElement>}
      />
    </>
  );
};
