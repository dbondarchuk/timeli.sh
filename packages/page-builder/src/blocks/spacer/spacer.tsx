import { BlockStyle, generateClassName } from "@vivid/page-builder-base/reader";
import { cn } from "@vivid/ui";
import { forwardRef } from "react";
import { SpacerReaderProps } from "./schema";
import { getDefaults, styles } from "./styles";

export const Spacer = forwardRef<
  HTMLDivElement,
  Pick<SpacerReaderProps, "props" | "style" | "block">
>(({ props, style, block, ...rest }, ref) => {
  const className = generateClassName();
  const defaults = getDefaults({ props, style });
  const base = block?.base;

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        defaults={defaults}
        styles={style}
      />
      <div
        className={cn(className, base?.className)}
        id={base?.id}
        ref={ref}
        {...rest}
      />
    </>
  );
});
