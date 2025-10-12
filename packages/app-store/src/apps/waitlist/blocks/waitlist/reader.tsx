import {
  BlockStyle,
  generateClassName,
  ReplaceOriginalColors,
} from "@vivid/page-builder-base/reader";
import { cn } from "@vivid/ui";
import { Waitlist } from "./components/waitlist";
import { WaitlistReaderProps } from "./schema";
import { styles } from "./styles";

export const WaitlistReader = ({
  props,
  style,
  args,
  isEditor,
  appId,
  ...rest
}: WaitlistReaderProps) => {
  const className = generateClassName();
  const base = rest.block.base;

  return (
    <>
      <BlockStyle name={className} styleDefinitions={styles} styles={style} />
      {isEditor && <ReplaceOriginalColors />}
      <Waitlist
        className={cn(className, base?.className)}
        id={base?.id}
        appId={appId}
      />
    </>
  );
};
