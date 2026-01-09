import { BlogPostNavigationButtonEditorWrapper } from "./editor-wrapper";
import { BlogPostNavigationButtonReaderProps } from "./schema";
import { BlogPostNavigationButtonServerWrapper } from "./server-wrapper";

export const BlogPostNavigationButtonReader = ({
  props,
  style,
  block,
  args,
  isEditor,
}: BlogPostNavigationButtonReaderProps & { isEditor?: boolean }) => {
  if (isEditor) {
    return (
      <BlogPostNavigationButtonEditorWrapper
        props={props}
        style={style}
        blockBase={block.base}
      />
    );
  }

  return (
    <BlogPostNavigationButtonServerWrapper
      props={props}
      style={style}
      blockBase={block.base}
      args={args}
    />
  );
};
