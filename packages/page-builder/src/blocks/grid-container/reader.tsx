import { ReaderBlock } from "@timelish/builder";
import {
  BlockStyle,
  generateClassName,
} from "@timelish/page-builder-base/reader";
import { cn } from "@timelish/ui";
import { GridContainerReaderProps, styles } from "./schema";

export const GridContainerReader = ({
  style,
  props,
  block,
  ...rest
}: GridContainerReaderProps) => {
  const children = props?.children ?? [];

  const className = generateClassName();
  const base = block.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <div className={cn(className, base?.className)} id={base?.id}>
        {children.map((child) => (
          <ReaderBlock key={child.id} {...rest} block={child} />
        ))}
      </div>
    </>
  );
};
