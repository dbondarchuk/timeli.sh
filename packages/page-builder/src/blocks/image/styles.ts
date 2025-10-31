import {
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
