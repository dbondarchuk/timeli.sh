"use client";

import { blogPostsListFixtures } from "../fixtures";
import { BlogPostsContainerComponent } from "./component";
import { BlogPostsContainerReaderProps } from "./schema";

type BlogPostsContainerEditorWrapperProps = {
  props: BlogPostsContainerReaderProps["props"];
  style: BlogPostsContainerReaderProps["style"];
  blockBase?: { className?: string; id?: string };
  restProps: any;
  appId?: string;
  args?: any;
};

export const BlogPostsContainerEditorWrapper = ({
  props,
  style,
  blockBase,
  restProps,
  appId,
  args,
}: BlogPostsContainerEditorWrapperProps) => {
  const children = props?.children ?? [];
  const postsPerPage = props?.postsPerPage ?? 10;

  // Use fixtures in editor mode
  return (
    <BlogPostsContainerComponent
      posts={blogPostsListFixtures}
      totalPosts={blogPostsListFixtures.length}
      page={1}
      postsPerPage={postsPerPage}
      children={children}
      style={style}
      blockBase={blockBase}
      restProps={restProps}
      isEditor={true}
      appId={appId}
      args={args}
    />
  );
};
