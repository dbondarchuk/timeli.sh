import { BlockStyle, generateClassName } from "@vivid/page-builder-base/reader";
import { cn } from "@vivid/ui";
import { InlineTextPropsDefaults, InlineTextReaderProps } from "./schema";
import { styles } from "./styles";

export const InlineText = ({ props, style, block }: InlineTextReaderProps) => {
  const text = props?.text ?? InlineTextPropsDefaults.props.text;
  const base = block.base;

  const className = generateClassName();
  const Element = "span";
  // const Element = props?.url ? "a" : "span";

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      <Element
        className={cn(className, base?.className)}
        id={base?.id}
        // href={props?.url ?? undefined}
      >
        {text}
      </Element>
    </>
  );
};
