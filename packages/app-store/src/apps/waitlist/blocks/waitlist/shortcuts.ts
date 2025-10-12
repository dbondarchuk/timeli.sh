import {
  colorShortcut,
  fontFamilyShortcut,
  Shortcut,
} from "@vivid/page-builder-base";
import { AllStylesSchemas } from "@vivid/page-builder-base/style";
import { Move } from "lucide-react";

export const waitlistShortcuts: Shortcut<AllStylesSchemas>[] = [
  {
    label: "pageBuilder.blocks.container.shortcuts.gap",
    icon: Move,
    options: [
      {
        label: "pageBuilder.blocks.container.gaps.none",
        value: "none",
        targetStyles: {
          gap: { value: 0, unit: "rem" },
        },
      },
      {
        label: "pageBuilder.blocks.container.gaps.small",
        value: "small",
        targetStyles: {
          gap: { value: 0.25, unit: "rem" },
        },
      },
      {
        label: "pageBuilder.blocks.container.gaps.medium",
        value: "medium",
        targetStyles: {
          gap: { value: 1, unit: "rem" },
        },
      },
      {
        label: "pageBuilder.blocks.container.gaps.large",
        value: "large",
        targetStyles: {
          gap: { value: 2, unit: "rem" },
        },
      },
      {
        label: "pageBuilder.blocks.container.gaps.x-large",
        value: "x-large",
        targetStyles: {
          gap: { value: 4, unit: "rem" },
        },
      },
    ],
  },
  fontFamilyShortcut as Shortcut<AllStylesSchemas>,
  colorShortcut,
];
