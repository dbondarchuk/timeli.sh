import { BlogCommentDateDisplay } from "./display";
import { BlogCommentDateReaderProps } from "./schema";

export const BlogCommentDateReader = ({
  props,
  style,
  block,
  args,
}: BlogCommentDateReaderProps) => {
  return (
    <BlogCommentDateDisplay
      props={props}
      style={style}
      block={block}
      args={args}
    />
  );
};
