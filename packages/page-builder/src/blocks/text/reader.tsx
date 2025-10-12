import { BlockStyle, generateClassName } from "@vivid/page-builder-base/reader";
import { PlateStaticEditor } from "@vivid/rte";
import { cn } from "@vivid/ui";
import { TextPropsDefaults, TextReaderProps } from "./schema";
import { getDefaults, styles } from "./styles";

export const TextReader = ({ props, style, block }: TextReaderProps) => {
  const value = props?.value ?? TextPropsDefaults.props.value;
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
      <div className={cn(className, base?.className)} id={base?.id}>
        <PlateStaticEditor value={value} />
      </div>
    </>
  );
};
