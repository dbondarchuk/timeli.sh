import { ReaderBlock } from "@vivid/builder";
import { BlockStyle, generateClassName } from "@vivid/page-builder-base/reader";
import { cn } from "@vivid/ui";
import { AccordionReaderProps } from "./schema";
import { styles } from "./styles";

export const Accordion = ({
  props,
  style,
  block,
  ...rest
}: AccordionReaderProps) => {
  const children = props?.children ?? [];
  const className = generateClassName();
  const base = block.base;

  const { animation, iconPosition, iconStyle } = props;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <div className={cn(className, base?.className)} id={base?.id}>
        {children.map((child: any) => (
          <ReaderBlock
            key={child.id}
            block={child}
            {...rest}
            animation={animation}
            iconPosition={iconPosition}
            iconStyle={iconStyle}
          />
        ))}
      </div>
    </>
  );
};
