import {
  BlockStyle,
  generateClassName,
  ReplaceOriginalColors,
} from "@timelish/page-builder-base/reader";
import { cn } from "@timelish/ui";
import { BlogPostContentReaderComponent } from "./components/reader";
import { BlogPostContentReaderProps } from "./schema";
import { styles } from "./styles";

export const BlogPostContentReader = ({
  props,
  style,
  args,
  isEditor,
  appId,
  ...rest
}: BlogPostContentReaderProps) => {
  const className = generateClassName();
  const base = rest.block.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      {isEditor && <ReplaceOriginalColors />}
      <BlogPostContentReaderComponent
        className={cn(className, base?.className)}
        id={base?.id}
        appId={appId}
        args={args}
        paramKey={props.paramKey}
        isEditor={isEditor}
      />
    </>
  );
};
