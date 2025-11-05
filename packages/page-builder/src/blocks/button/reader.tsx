import { ReaderBlock } from "@timelish/builder";
import {
  BlockStyle,
  generateClassName,
} from "@timelish/page-builder-base/reader";
import { cn } from "@timelish/ui";
import { Button } from "./button";
import { ButtonReaderProps } from "./schema";
import { styles } from "./styles";
import { getDefaults } from "./styles.default";

export const ButtonReader = ({
  props,
  style,
  block,
  ...rest
}: ButtonReaderProps) => {
  const content = props?.children?.[0];
  const defaults = getDefaults({ props, style }, false);

  const className = generateClassName();
  const base = block.base;

  const { children, ...restProps } = props || {};

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        defaults={defaults}
      />
      <Button
        id={base?.id}
        className={cn("block", className, base?.className)}
        {...restProps}
      >
        {content && <ReaderBlock key={content.id} {...rest} block={content} />}
      </Button>
    </>
  );
};
