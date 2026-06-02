import { blogCommentFixtures } from "../comment-fixtures";
import { BlogCommentsContainerComponent } from "./component";
import { BlogCommentsContainerReaderProps } from "./schema";
import { BlogCommentsContainerServerWrapper } from "./server-wrapper";

const isServer = typeof window === "undefined";

export const BlogCommentsContainerReader = ({
  style,
  props,
  block,
  args,
  isEditor,
  ...rest
}: BlogCommentsContainerReaderProps & { isEditor?: boolean }) => {
  const appId = block.metadata?.blogAppId;

  if (isEditor || !isServer) {
    return (
      <BlogCommentsContainerComponent
        style={style}
        comments={blogCommentFixtures}
        totalComments={blogCommentFixtures.length}
        page={1}
        commentsPerPage={props?.commentsPerPage ?? 10}
        appId={appId}
        children={props?.children ?? []}
        restProps={rest}
        isEditor={isEditor}
        args={args}
      />
    );
  }

  return (
    <BlogCommentsContainerServerWrapper
      props={props}
      style={style}
      blockBase={block.base}
      restProps={rest}
      appId={appId}
      args={args}
    />
  );
};
