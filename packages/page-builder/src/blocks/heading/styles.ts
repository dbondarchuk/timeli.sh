import { DefaultHeadingLevel, type HeadingProps } from "./schema";

import {
  ALL_STYLES,
  AllStylesSchemas,
  DefaultCSSProperties,
  getStylesSchema,
} from "@vivid/page-builder-base/style";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export function getFontSize(
  level: NonNullable<NonNullable<HeadingProps["props"]>["level"]>,
) {
  switch (level) {
    case "h1":
      return 2;
    case "h2":
      return 1.5;
    case "h3":
      return 1.25;
    case "h4":
      return 1;
    case "h5":
      return 0.875;
    case "h6":
      return 0.75;
  }
}

export const getDefaults = (
  level: NonNullable<HeadingProps["props"]>["level"],
): DefaultCSSProperties<AllStylesSchemas> => ({
  fontWeight: "bold",
  textAlign: "center",
  fontSize: {
    value: getFontSize(level || DefaultHeadingLevel),
    unit: "rem",
  },
});
