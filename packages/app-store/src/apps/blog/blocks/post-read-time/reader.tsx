import { BlogPostReadTimeComponent } from "./component";
import { BlogPostReadTimeReaderProps } from "./schema";

export const BlogPostReadTimeReader = ({
  props,
  style,
  block,
  args,
}: BlogPostReadTimeReaderProps) => {
  return (
    <BlogPostReadTimeComponent
      props={props}
      style={style}
      blockBase={block.base}
      args={args}
    />
  );
};
