import {
  ALL_STYLES,
  AllStylesSchemas,
  DefaultCSSProperties,
  getStylesSchema,
} from "@vivid/page-builder-base/style";
import { type IconProps } from "./schema";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export const getDefaults = (
  { props, style }: IconProps,
  isEditor?: boolean,
): DefaultCSSProperties<AllStylesSchemas> => {
  return {
    display: "block",
  };
};
