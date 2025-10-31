import type {
  AllStylesSchemas,
  DefaultCSSProperties,
} from "@vivid/page-builder-base/style";
import type { IconProps } from "./schema";

export const getDefaults = (
  { props, style }: IconProps,
  isEditor?: boolean,
): DefaultCSSProperties<AllStylesSchemas> => {
  return {
    display: "block",
  };
};
