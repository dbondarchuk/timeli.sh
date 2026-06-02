import { BlogCommentAuthorDisplay } from "./display";
import { BlogCommentAuthorReaderProps } from "./schema";

export const BlogCommentAuthorReader = ({
  style,
  block,
  args,
}: BlogCommentAuthorReaderProps) => {
  return <BlogCommentAuthorDisplay style={style} block={block} args={args} />;
};
