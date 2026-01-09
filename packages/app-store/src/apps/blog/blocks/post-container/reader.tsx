import { BlogPostContainerEditorWrapper } from "./editor-wrapper";
import { BlogPostContainerReaderProps } from "./schema";
import { BlogPostContainerServerWrapper } from "./server-wrapper";

const isServer = typeof window === "undefined";
export const BlogPostContainerReader = ({
  style,
  props,
  block,
  args,
  isEditor,
  ...rest
}: BlogPostContainerReaderProps & { isEditor?: boolean }) => {
  const metadata = block.metadata;
  const appId = metadata?.blogAppId;

  if (isEditor || !isServer) {
    return (
      <BlogPostContainerEditorWrapper
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
    <BlogPostContainerServerWrapper
      props={props}
      style={style}
      blockBase={block.base}
      restProps={rest}
      appId={appId}
      args={args}
    />
  );
};
