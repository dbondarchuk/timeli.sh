import {
  BlockStyle,
  generateClassName,
  ReplaceOriginalColors,
} from "@timelish/page-builder-base/reader";
import { cn } from "@timelish/ui";
import { BlogTagListReaderProps } from "./schema";
import { styles } from "./styles";
import { BlogTagListReaderComponent } from "./components/tag-list-reader";

export const BlogTagListReader = ({
  props,
  style,
  args,
  isEditor,
  appId,
  ...rest
}: BlogTagListReaderProps) => {
  const className = generateClassName();
  const base = rest.block.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      {isEditor && <ReplaceOriginalColors />}
      <BlogTagListReaderComponent
        className={cn(className, base?.className)}
        id={base?.id}
        appId={appId}
        props={props}
      />
    </>
  );
};

