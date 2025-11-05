import { CustomHTMLReaderProps } from "./schema";

export const CustomHTML = ({ props, block }: CustomHTMLReaderProps) => {
  const base = block.base;

  return (
    <div
      className={base?.className}
      id={base?.id}
      dangerouslySetInnerHTML={{ __html: props?.html ?? "" }}
    />
  );
};
