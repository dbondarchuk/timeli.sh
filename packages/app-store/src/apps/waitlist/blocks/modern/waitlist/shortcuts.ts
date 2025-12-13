import {
  colorShortcut,
  fontFamilyShortcut,
  Shortcut,
} from "@timelish/page-builder-base";
import { AllStylesSchemas } from "@timelish/page-builder-base/style";

export const waitlistShortcuts: Shortcut<AllStylesSchemas>[] = [
  fontFamilyShortcut as Shortcut<AllStylesSchemas>,
  colorShortcut,
];
