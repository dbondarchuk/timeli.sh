import { ReaderBlock } from "@timelish/builder";
import {
  BlockStyle,
  generateClassName,
} from "@timelish/page-builder-base/reader";
import { cn } from "@timelish/ui";
import { InlineContainerReaderProps, styles } from "./schema";

export const InlineContainerReader = ({
  style,
  props,
  block,
  ...rest
}: InlineContainerReaderProps) => {
  const children = props?.children ?? [];

  const className = generateClassName();
  const base = block.base;
  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <span className={cn(className, base?.className)} id={base?.id}>
        {children.map((child) => (
          <ReaderBlock key={child.id} {...rest} block={child} />
        ))}
      </span>
    </>
  );
};
