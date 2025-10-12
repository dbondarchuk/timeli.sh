import { BlockStyle, generateClassName } from "@vivid/page-builder-base/reader";
import { cn } from "@vivid/ui";
import { CustomHTMLReaderProps } from "./schema";
import { getDefaults, styles } from "./styles";

export const CustomHTML = ({ props, style, block }: CustomHTMLReaderProps) => {
  const defaults = getDefaults({ props, style }, false);

  const className = generateClassName();
  const base = block.base;

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        defaults={defaults}
      />
      <div
        className={cn(className, base?.className)}
        id={base?.id}
        dangerouslySetInnerHTML={{ __html: props?.html ?? "" }}
      />
    </>
  );
};
