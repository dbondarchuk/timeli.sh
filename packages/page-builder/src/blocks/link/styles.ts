import { type LinkProps } from "./schema";

import {
  ALL_STYLES,
  AllStylesSchemas,
  DefaultCSSProperties,
  getStylesSchema,
} from "@vivid/page-builder-base/style";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export const getDefaults = (
  { props, style }: LinkProps,
  isEditor?: boolean,
): DefaultCSSProperties<AllStylesSchemas> => {
  return {
    fontSize: { value: 1, unit: "rem" },
    fontWeight: "normal",
    textAlign: "left",
    textDecoration: "underline",
    display: "block",
    width: "max-content",
  };
};
