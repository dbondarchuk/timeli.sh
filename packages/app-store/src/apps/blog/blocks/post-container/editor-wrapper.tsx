"use client";

import { ReaderBlock } from "@timelish/builder";
import {
  BlockStyle,
  generateClassName,
} from "@timelish/page-builder-base/reader";
import { cn } from "@timelish/ui";
import { blogPostsListFixtures } from "../fixtures";
import { BlogPostContainerReaderProps, styles } from "./schema";

type BlogPostContainerEditorWrapperProps = {
  props: BlogPostContainerReaderProps["props"];
  style: BlogPostContainerReaderProps["style"];
  blockBase?: { className?: string; id?: string };
  restProps: any;
  appId?: string;
  args?: any;
};

export const BlogPostContainerEditorWrapper = ({
  props,
  style,
  blockBase,
  restProps,
  appId,
  args,
}: BlogPostContainerEditorWrapperProps) => {
  const children = props?.children ?? [];
  const postUrl = props?.postUrl ?? "/blog/[slug]";
  const fixturePost = blogPostsListFixtures[0];

  // Generate postLink by replacing [slug] with fixture post slug
  const postLink = fixturePost
    ? postUrl.replace("[slug]", fixturePost.slug)
    : null;

  // Use fixtures in editor mode
  const className = generateClassName();
  const base = blockBase;

  // Inject post and postLink into args for child blocks
  const newArgs = {
    ...args,
    post: fixturePost,
    postLink,
    blogAppId: appId ?? args?.blogAppId,
  };

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <div className={cn(className, base?.className)} id={base?.id}>
        {children.map((child) => (
          <ReaderBlock
            key={child.id}
            {...restProps}
            block={child}
            args={newArgs}
            isEditor={true}
          />
        ))}
      </div>
    </>
  );
};
