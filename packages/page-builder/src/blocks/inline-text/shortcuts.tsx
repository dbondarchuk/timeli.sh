import {
  backgroundColorShortcut,
  colorShortcut,
  fontFamilyShortcut,
  Shortcut,
} from "@timelish/page-builder-base";
import { AllStylesSchemas } from "@timelish/page-builder-base/style";

export const inlineTextShortcuts: Shortcut<AllStylesSchemas>[] = [
  backgroundColorShortcut,
  fontFamilyShortcut as Shortcut<AllStylesSchemas>,
  colorShortcut,
];
