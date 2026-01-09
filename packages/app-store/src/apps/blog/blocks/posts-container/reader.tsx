import { BlogPostsContainerEditorWrapper } from "./editor-wrapper";
import { BlogPostsContainerReaderProps } from "./schema";
import { BlogPostsContainerServerWrapper } from "./server-wrapper";

const isServer = typeof window === "undefined";
export const BlogPostsContainerReader = ({
  style,
  props,
  block,
  args,
  isEditor,
  ...rest
}: BlogPostsContainerReaderProps & { isEditor?: boolean }) => {
  const metadata = block.metadata;
  const appId = metadata?.blogAppId;

  if (isEditor || !isServer) {
    return (
      <BlogPostsContainerEditorWrapper
        props={props}
        style={style}
        blockBase={block.base}
        restProps={rest}
        appId={appId}
        args={args}
      />
    );
  }

  return (
    <BlogPostsContainerServerWrapper
      props={props}
      style={style}
      blockBase={block.base}
      restProps={rest}
      appId={appId}
      args={args}
    />
  );
};
