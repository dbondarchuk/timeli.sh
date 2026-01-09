import { evaluate, ReaderBlock } from "@timelish/builder";
import {
  BlockStyle,
  generateClassName,
} from "@timelish/page-builder-base/reader";
import { cn } from "@timelish/ui";
import { Fragment } from "react";
import { ForeachContainerReaderProps, styles } from "./schema";

export const ForeachContainerReader = ({
  props,
  style,
  block,
  args,
  ...rest
}: ForeachContainerReaderProps) => {
  const children = props?.children ?? [];
  if (!props?.value) return null;

  const array: [] = evaluate(props?.value, args);
  if (!Array.isArray(array)) {
    return <div className="w-full">NOT ARRAY</div>;
  }

  const newCtx = (item: any) => ({
    ...args,
    [props?.itemName ?? "_item"]: item,
  });

  const className = generateClassName();
  const base = block.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <div className={cn(className, base?.className)} id={base?.id}>
        {array.map((item, index) => (
          <Fragment key={index}>
            {children.map((child) => (
              <ReaderBlock
                key={child.id}
                {...rest}
                block={child}
                args={newCtx(item)}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </>
  );
};
