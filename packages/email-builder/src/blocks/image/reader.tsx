import { Image } from "./image";
import { ImageProps } from "./schema";

export const ImageReader = ({ props, style }: ImageProps) => {
  return <Image props={props} style={style} />;
};
