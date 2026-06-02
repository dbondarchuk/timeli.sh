import { BlogCommentPublic } from "../../models";
import { BlogPublicAllKeys } from "../../translations/types";
import { BlogCommentContainerComponent } from "./component";
import { BlogCommentContainerReaderProps } from "./schema";

export const BlogCommentContainerReader = ({
  props,
  style,
  block,
  args,
  ...rest
}: BlogCommentContainerReaderProps) => {
  const children = props?.children ?? [];

  const comment =
    (args?.comment as BlogCommentPublic | undefined) ??
    (args?._item as BlogCommentPublic | undefined) ??
    null;

  const error = !comment
    ? ("app_blog_public.notInBlogContext" satisfies BlogPublicAllKeys)
    : null;

  return (
    <BlogCommentContainerComponent
      comment={comment}
      error={error}
      children={children}
      style={style}
      blockBase={block.base}
      restProps={rest}
      args={args}
    />
  );
};
