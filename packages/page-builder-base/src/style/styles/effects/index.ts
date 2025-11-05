import { animationStyle } from "./animation";
import { boxShadowStyle } from "./box-shadow";
import { cursorStyle } from "./cursor";
import { filterStyle } from "./filter";
import { hideStyle } from "./hide";
import { opacityStyle } from "./opacity";
import { overflowStyle } from "./overflow";
import { transformStyle } from "./transform";
import { transitionStyle } from "./transition";
import { zIndexStyle } from "./z-index";
import { zoomStyle } from "./zoom";

export * from "./animation";
export * from "./box-shadow";
export * from "./cursor";
export * from "./filter";
export * from "./hide";
export * from "./opacity";
export * from "./overflow";
export * from "./transform";
export * from "./transition";
export * from "./z-index";
export * from "./zoom";

export const effectsStyles = [
  animationStyle,
  boxShadowStyle,
  cursorStyle,
  hideStyle,
  opacityStyle,
  overflowStyle,
  zIndexStyle,
  transformStyle,
  transitionStyle,
  filterStyle,
  zoomStyle,
] as const;
