import { BlogPostCommentFormEditorWrapper } from "./editor-wrapper";
import { BlogPostCommentFormReaderProps } from "./schema";
import { BlogPostCommentFormServerWrapper } from "./server-wrapper";

const isServer = typeof window === "undefined";

export const BlogPostCommentFormReader = ({
  props,
  style,
  block,
  args,
  isEditor,
}: BlogPostCommentFormReaderProps & { isEditor?: boolean }) => {
  const appId =
    (block.metadata as { blogAppId?: string })?.blogAppId ?? args?.blogAppId;

  if (isEditor || !isServer) {
    return (
      <BlogPostCommentFormEditorWrapper
        props={props}
        style={style}
        blockBase={block.base}
        args={args}
        appId={appId}
      />
    );
  }

  return (
    <BlogPostCommentFormServerWrapper
      props={props}
      style={style}
      blockBase={block.base}
      args={args}
      blockMetadata={block.metadata as { blogAppId?: string }}
    />
  );
};
