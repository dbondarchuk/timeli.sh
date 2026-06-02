import {
  backgroundColorShortcut,
  colorShortcut,
  fontFamilyShortcut,
  fontSizeShortcut,
  Shortcut,
  textAlignmentShortcut,
} from "@timelish/page-builder-base";
import { AllStylesSchemas } from "@timelish/page-builder-base/style";

/** Same shortcuts as InlineText — for blog blocks that render static text. */
export const blogTextShortcuts: Shortcut<AllStylesSchemas>[] = [
  fontSizeShortcut as Shortcut<AllStylesSchemas>,
  textAlignmentShortcut as Shortcut<AllStylesSchemas>,
  backgroundColorShortcut,
  fontFamilyShortcut as Shortcut<AllStylesSchemas>,
  colorShortcut,
];
