import { evaluate, ReaderBlock } from "@timelish/builder";
import { Fragment } from "react";
import { ForeachContainerReaderProps } from "./schema";

export const ForeachContainerReader = ({
  props,
  args,
  ...rest
}: ForeachContainerReaderProps) => {
  const children = props?.children ?? [];
  if (!props?.value) return null;

  let array: [] | null;
  try {
    array = evaluate(props?.value, args);
  } catch (e) {
    console.error(e);
    array = null;
  }

  if (!Array.isArray(array)) {
    return <div className="w-full">NOT ARRAY</div>;
  }

  const newCtx = (item: any) => ({ ...args, _item: item });

  return (
    <>
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
    </>
  );
};
