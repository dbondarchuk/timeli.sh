import {
  backgroundColorShortcut,
  colorShortcut,
  fontFamilyShortcut,
  fontSizeShortcut,
  Shortcut,
  textAlignmentShortcut,
} from "@timelish/page-builder-base";
import { AllStylesSchemas } from "@timelish/page-builder-base/style";

export const inlineTextShortcuts: Shortcut<AllStylesSchemas>[] = [
  fontSizeShortcut as Shortcut<AllStylesSchemas>,
  textAlignmentShortcut as Shortcut<AllStylesSchemas>,
  backgroundColorShortcut,
  fontFamilyShortcut as Shortcut<AllStylesSchemas>,
  colorShortcut,
];
