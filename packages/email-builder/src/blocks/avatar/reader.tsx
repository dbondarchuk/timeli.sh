import { Avatar } from "./avatar";
import { AvatarProps } from "./schema";

export const AvatarReader = ({ props, style }: AvatarProps) => {
  return <Avatar props={props} style={style} />;
};
