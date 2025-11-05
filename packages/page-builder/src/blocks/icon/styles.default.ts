import type {
  AllStylesSchemas,
  DefaultCSSProperties,
} from "@timelish/page-builder-base/style";
import type { IconProps } from "./schema";

export const getDefaults = (
  { props, style }: IconProps,
  isEditor?: boolean,
): DefaultCSSProperties<AllStylesSchemas> => {
  return {
    display: "block",
  };
};
