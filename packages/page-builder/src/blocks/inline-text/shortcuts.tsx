import {
  backgroundColorShortcut,
  colorShortcut,
  fontFamilyShortcut,
  Shortcut,
} from "@vivid/page-builder-base";
import { AllStylesSchemas } from "@vivid/page-builder-base/style";

export const inlineTextShortcuts: Shortcut<AllStylesSchemas>[] = [
  backgroundColorShortcut,
  fontFamilyShortcut as Shortcut<AllStylesSchemas>,
  colorShortcut,
];
