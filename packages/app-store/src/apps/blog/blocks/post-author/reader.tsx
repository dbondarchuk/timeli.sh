import { BlogPostAuthorEditorWrapper } from "./editor-wrapper";
import { BlogPostAuthorReaderProps } from "./schema";
import { BlogPostAuthorServerWrapper } from "./server-wrapper";

const isServer = typeof window === "undefined";

export const BlogPostAuthorReader = ({
  props,
  style,
  block,
  args,
  isEditor,
}: BlogPostAuthorReaderProps & { isEditor?: boolean }) => {
  if (isEditor || !isServer) {
    return (
      <BlogPostAuthorEditorWrapper
        props={props}
        style={style}
        blockBase={block.base}
        args={args}
      />
    );
  }

  return (
    <BlogPostAuthorServerWrapper
      props={props}
      style={style}
      blockBase={block.base}
      args={args}
    />
  );
};
