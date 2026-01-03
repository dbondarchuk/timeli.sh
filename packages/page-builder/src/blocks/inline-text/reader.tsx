import {
  BlockStyle,
  generateClassName,
} from "@timelish/page-builder-base/reader";
import { StaticText } from "@timelish/rte-inline/reader";
import { cn } from "@timelish/ui";
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
      <StaticText
        value={text}
        className={cn(className, base?.className)}
        id={base?.id}
        inline={true}
      />
    </>
  );
};
