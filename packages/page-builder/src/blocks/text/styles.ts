import { type TextProps } from "./schema";

import {
  ALL_STYLES,
  AllStylesSchemas,
  DefaultCSSProperties,
  getStylesSchema,
} from "@vivid/page-builder-base/style";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export const getDefaults = (
  { props, style }: TextProps,
  isEditor?: boolean,
): DefaultCSSProperties<AllStylesSchemas> => ({
  fontSize: {
    value: 1,
    unit: "rem",
  },
  color: "var(--value-foreground-color)",
  padding: {
    top: {
      value: 0,
      unit: "rem",
    },
    bottom: {
      value: 0,
      unit: "rem",
    },
    left: {
      value: 0,
      unit: "rem",
    },
    right: {
      value: 0,
      unit: "rem",
    },
  },
});
