import { BlogCommentBodyDisplay } from "./display";
import { BlogCommentBodyReaderProps } from "./schema";

export const BlogCommentBodyReader = ({
  props,
  style,
  block,
  args,
}: BlogCommentBodyReaderProps) => {
  return <BlogCommentBodyDisplay style={style} block={block} args={args} />;
};
