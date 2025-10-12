import { type ImageProps } from "./schema";

import {
  DefaultCSSProperties,
  getAllStylesWithAdditionalStyles,
  getStylesSchema,
  objectFitStyle,
  objectPositionStyle,
} from "@vivid/page-builder-base/style";

export const styles = getAllStylesWithAdditionalStyles({
  objectFit: objectFitStyle,
  objectPosition: objectPositionStyle,
});

export const zStyles = getStylesSchema(styles);
export type ImageStylesSchema = {
  [key in keyof typeof styles]: (typeof styles)[key]["schema"];
};

export const getDefaults = (
  { props, style }: ImageProps,
  isEditor?: boolean,
): DefaultCSSProperties<ImageStylesSchema> => ({
  display: "inline-block",
  textDecoration: "none",
  objectFit: "cover",
  objectPosition: { x: 50, y: 50 },
  verticalAlign: "middle",
  maxWidth: {
    value: 100,
    unit: "%",
  },
});
