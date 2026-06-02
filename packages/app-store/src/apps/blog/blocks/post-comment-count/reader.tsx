import { BlogPostCommentCountEditorWrapper } from "./editor-wrapper";
import { BlogPostCommentCountReaderProps } from "./schema";
import { BlogPostCommentCountServerWrapper } from "./server-wrapper";

const isServer = typeof window === "undefined";

export const BlogPostCommentCountReader = ({
  props,
  style,
  block,
  args,
  isEditor,
}: BlogPostCommentCountReaderProps & { isEditor?: boolean }) => {
  if (isEditor || !isServer) {
    return (
      <BlogPostCommentCountEditorWrapper
        props={props}
        style={style}
        blockBase={block.base}
        args={args}
      />
    );
  }

  return (
    <BlogPostCommentCountServerWrapper
      props={props}
      style={style}
      blockBase={block.base}
      args={args}
      blockMetadata={block.metadata as { blogAppId?: string }}
    />
  );
};
