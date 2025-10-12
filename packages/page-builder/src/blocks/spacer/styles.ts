import {
  ALL_STYLES,
  AllStylesSchemas,
  DefaultCSSProperties,
  getStylesSchema,
} from "@vivid/page-builder-base/style";

import { type SpacerProps } from "./schema";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export const getDefaults = (
  { props, style }: SpacerProps,
  isEditor?: boolean,
): DefaultCSSProperties<AllStylesSchemas> => {
  return {
    display: "block",
    height: {
      value: 1,
      unit: "rem",
    },
  };
};
