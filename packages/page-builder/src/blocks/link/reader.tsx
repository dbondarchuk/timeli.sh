import { ReaderBlock } from "@vivid/builder";
import { BlockStyle, generateClassName } from "@vivid/page-builder-base/reader";
import { cn } from "@vivid/ui";
import { LinkDefaultUrl, LinkReaderProps } from "./schema";
import { getDefaults, styles } from "./styles";

export const Link = ({ props, style, block, ...rest }: LinkReaderProps) => {
  const url = (props as any)?.url ?? LinkDefaultUrl;
  const content = (props as any)?.children?.[0];
  const defaults = getDefaults({ props, style }, false);

  const className = generateClassName();
  const base = block.base;

  return (
    <>
      <BlockStyle
        name={className}
        styleDefinitions={styles}
        styles={style}
        defaults={defaults}
      />
      <a
        href={url}
        target={(props as any)?.target ?? undefined}
        className={cn(className, base?.className)}
        id={base?.id}
      >
        {content && <ReaderBlock key={content.id} {...rest} block={content} />}
      </a>
    </>
  );
};
