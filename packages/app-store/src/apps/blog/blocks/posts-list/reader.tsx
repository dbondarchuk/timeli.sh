import {
  BlockStyle,
  generateClassName,
  ReplaceOriginalColors,
} from "@timelish/page-builder-base/reader";
import { cn } from "@timelish/ui";
import { BlogPostsListReaderComponent } from "./components/reader";
import { BlogPostsListReaderProps } from "./schema";
import { styles } from "./styles";

export const BlogPostsListReader = ({
  props,
  style,
  args,
  isEditor,
  appId,
  ...rest
}: BlogPostsListReaderProps) => {
  const className = generateClassName();
  const base = rest.block.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      {isEditor && <ReplaceOriginalColors />}
      <BlogPostsListReaderComponent
        className={cn(className, base?.className)}
        id={base?.id}
        appId={appId}
        args={args}
        postsPerPage={props.postsPerPage}
        isEditor={isEditor}
      />
    </>
  );
};
