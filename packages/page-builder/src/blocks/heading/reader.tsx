import { ReaderBlock } from "@vivid/builder";
import { BlockStyle, generateClassName } from "@vivid/page-builder-base/reader";
import { cn } from "@vivid/ui";
import { DefaultHeadingLevel, HeadingReaderProps } from "./schema";
import { styles } from "./styles";
import { getDefaults } from "./styles.default";

export const Heading = ({
  props,
  style,
  block,
  ...rest
}: HeadingReaderProps) => {
  const level = props?.level ?? DefaultHeadingLevel;
  const content = props?.children?.[0];
  const defaults = getDefaults(level);

  const className = generateClassName();
  const Element = level;
  const base = block.base;

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        defaults={defaults}
      />
      <Element className={cn(className, base?.className)} id={base?.id}>
        {content && <ReaderBlock key={content.id} {...rest} block={content} />}
      </Element>
    </>
  );
};
