import { alignItemsStyle } from "./align-items";
import { aspectRatioStyle } from "./aspect-ratio";
import { displayStyle } from "./display";
import { flexBasisStyle } from "./flex-basis";
import { flexDirectionStyle } from "./flex-direction";
import { flexWrapStyle } from "./flex-wrap";
import { gridTemplateColumnsStyle } from "./grid-template-columns";
import { heightStyle } from "./height";
import { insetStyle } from "./inset";
import { justifyContentStyle } from "./justify-content";
import { justifyItemsStyle } from "./justify-items";
import { maxHeightStyle } from "./max-height";
import { maxWidthStyle } from "./max-width";
import { minHeightStyle } from "./min-height";
import { minWidthStyle } from "./min-width";
import { positionStyle } from "./position";
import { verticalAlignStyle } from "./vertical-align";
import { widthStyle } from "./width";

export * from "./align-items";
export * from "./aspect-ratio";
export * from "./display";
export * from "./flex-basis";
export * from "./flex-direction";
export * from "./flex-wrap";
export * from "./grid-template-columns";
export * from "./height";
export * from "./inset";
export * from "./justify-content";
export * from "./justify-items";
export * from "./max-height";
export * from "./max-width";
export * from "./min-height";
export * from "./min-width";
export * from "./object-fit";
export * from "./object-position";
export * from "./position";
export * from "./vertical-align";
export * from "./width";

export const layoutStyles = [
  displayStyle,
  heightStyle,
  positionStyle,
  insetStyle,
  widthStyle,
  minWidthStyle,
  maxWidthStyle,
  minHeightStyle,
  maxHeightStyle,
  flexDirectionStyle,
  justifyContentStyle,
  justifyItemsStyle,
  alignItemsStyle,
  flexWrapStyle,
  flexBasisStyle,
  gridTemplateColumnsStyle,
  verticalAlignStyle,
  aspectRatioStyle,
] as const;
