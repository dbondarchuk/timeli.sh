import { colorStyle } from "./color";
import { fontFamilyStyle } from "./font-family";
import { fontSizeStyle } from "./font-size";
import { fontStyleStyle } from "./font-style";
import { fontWeightStyle } from "./font-weight";
import { letterSpacingStyle } from "./letter-spacing";
import { lineHeightStyle } from "./line-height";
import { textAlignStyle } from "./text-align";
import { textDecorationStyle } from "./text-decoration";
import { textTransformStyle } from "./text-transform";
import { wordSpacingStyle } from "./word-spacing";

export * from "./color";
export * from "./font-family";
export * from "./font-size";
export * from "./font-style";
export * from "./font-weight";
export * from "./letter-spacing";
export * from "./line-height";
export * from "./text-align";
export * from "./text-decoration";
export * from "./text-transform";
export * from "./word-spacing";

export const typographyStyles = [
  colorStyle,
  fontFamilyStyle,
  fontSizeStyle,
  fontStyleStyle,
  fontWeightStyle,
  letterSpacingStyle,
  lineHeightStyle,
  textAlignStyle,
  textDecorationStyle,
  textTransformStyle,
  wordSpacingStyle,
] as const;
