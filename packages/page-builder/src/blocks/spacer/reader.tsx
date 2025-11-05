import { SpacerReaderProps } from "./schema";
import { Spacer } from "./spacer";

export const SpacerReader = ({ props, style, block }: SpacerReaderProps) => {
  return <Spacer props={props} style={style} block={block} />;
};
