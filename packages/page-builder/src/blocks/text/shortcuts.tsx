import {
  backgroundColorShortcut,
  colorShortcut,
  fontFamilyShortcut,
  Shortcut,
} from "@vivid/page-builder-base";
import { AllStylesSchemas, COLORS } from "@vivid/page-builder-base/style";
import {
  AlignLeft,
  Bold,
  CaseSensitive,
  Space,
  TypeOutline,
} from "lucide-react";

export const textShortcuts: Shortcut<AllStylesSchemas>[] = [
  {
    label: "pageBuilder.blocks.text.shortcuts.size",
    icon: ({ className }) => <CaseSensitive className={className} />,
    options: [
      {
        label: "pageBuilder.blocks.text.sizes.small",
        value: "small",
        targetStyles: {
          fontSize: { value: 0.875, unit: "rem" },
        },
      },
      {
        label: "pageBuilder.blocks.text.sizes.medium",
        value: "medium",
        targetStyles: {
          fontSize: { value: 1, unit: "rem" },
        },
      },
      {
        label: "pageBuilder.blocks.text.sizes.large",
        value: "large",
        targetStyles: {
          fontSize: { value: 1.125, unit: "rem" },
        },
      },
      {
        label: "pageBuilder.blocks.text.sizes.x-large",
        value: "x-large",
        targetStyles: {
          fontSize: { value: 1.25, unit: "rem" },
        },
      },
    ],
  },
  {
    label: "pageBuilder.blocks.text.shortcuts.weight",
    icon: ({ className }) => <Bold className={className} />,
    options: [
      {
        label: "pageBuilder.blocks.text.weights.light",
        value: "light",
        targetStyles: {
          fontWeight: "300",
        },
      },
      {
        label: "pageBuilder.blocks.text.weights.normal",
        value: "normal",
        targetStyles: {
          fontWeight: "normal",
        },
      },
      {
        label: "pageBuilder.blocks.text.weights.medium",
        value: "medium",
        targetStyles: {
          fontWeight: "500",
        },
      },
      {
        label: "pageBuilder.blocks.text.weights.bold",
        value: "bold",
        targetStyles: {
          fontWeight: "bold",
        },
      },
    ],
  },
  {
    label: "pageBuilder.blocks.text.shortcuts.alignment",
    icon: ({ className }) => <AlignLeft className={className} />,
    options: [
      {
        label: "pageBuilder.blocks.text.alignments.left",
        value: "left",
        targetStyles: {
          textAlign: "left",
        },
      },
      {
        label: "pageBuilder.blocks.text.alignments.center",
        value: "center",
        targetStyles: {
          textAlign: "center",
        },
      },
      {
        label: "pageBuilder.blocks.text.alignments.right",
        value: "right",
        targetStyles: {
          textAlign: "right",
        },
      },
      {
        label: "pageBuilder.blocks.text.alignments.justify",
        value: "justify",
        targetStyles: {
          textAlign: "justify",
        },
      },
    ],
  },
  {
    label: "pageBuilder.blocks.text.shortcuts.style",
    icon: ({ className }) => <TypeOutline className={className} />,
    options: [
      {
        label: "pageBuilder.blocks.text.styles.body",
        value: "body",
        targetStyles: {
          fontSize: { value: 1, unit: "rem" },
          fontWeight: "normal",
          lineHeight: { value: 1.6, unit: "rem" },
          color: COLORS["foreground"].value,
        },
      },
      {
        label: "pageBuilder.blocks.text.styles.lead",
        value: "lead",
        targetStyles: {
          fontSize: { value: 1.125, unit: "rem" },
          fontWeight: "normal",
          lineHeight: { value: 1.7, unit: "rem" },
          color: COLORS["muted-foreground"].value,
        },
      },
      {
        label: "pageBuilder.blocks.text.styles.caption",
        value: "caption",
        targetStyles: {
          fontSize: { value: 0.875, unit: "rem" },
          fontWeight: "normal",
          lineHeight: { value: 1.4, unit: "rem" },
          color: COLORS["muted-foreground"].value,
          textTransform: "uppercase",
          letterSpacing: { value: 0.05, unit: "rem" },
        },
      },
      {
        label: "pageBuilder.blocks.text.styles.quote",
        value: "quote",
        targetStyles: {
          fontSize: { value: 1.125, unit: "rem" },
          fontWeight: "500",
          lineHeight: { value: 1.6, unit: "rem" },
          padding: (prev) => ({
            top: prev?.top ?? { value: 1, unit: "rem" },
            bottom: prev?.bottom ?? { value: 1, unit: "rem" },
            left: { value: 1.5, unit: "rem" },
            right: prev?.right ?? { value: 0, unit: "rem" },
          }),
          // borderLeft: { value: 4, unit: "px" },
          // borderLeftColor: "var(--primary)",
          // borderLeftStyle: "solid",
        },
      },
    ],
  },
  {
    label: "pageBuilder.blocks.text.shortcuts.spacing",
    icon: ({ className }) => <Space className={className} />,
    options: [
      {
        label: "pageBuilder.blocks.text.spacings.compact",
        value: "compact",
        targetStyles: {
          padding: {
            top: { value: 0.5, unit: "rem" },
            bottom: { value: 0.5, unit: "rem" },
            left: { value: 0.75, unit: "rem" },
            right: { value: 0.75, unit: "rem" },
          },
          margin: {
            top: { value: 0.25, unit: "rem" },
            bottom: { value: 0.25, unit: "rem" },
            left: "auto",
            right: "auto",
          },
        },
      },
      {
        label: "pageBuilder.blocks.text.spacings.comfortable",
        value: "comfortable",
        targetStyles: {
          padding: {
            top: { value: 1, unit: "rem" },
            bottom: { value: 1, unit: "rem" },
            left: { value: 1.5, unit: "rem" },
            right: { value: 1.5, unit: "rem" },
          },
          margin: {
            top: { value: 0.5, unit: "rem" },
            bottom: { value: 0.5, unit: "rem" },
            left: "auto",
            right: "auto",
          },
        },
      },
      {
        label: "pageBuilder.blocks.text.spacings.loose",
        value: "loose",
        targetStyles: {
          padding: {
            top: { value: 1.5, unit: "rem" },
            bottom: { value: 1.5, unit: "rem" },
            left: { value: 2, unit: "rem" },
            right: { value: 2, unit: "rem" },
          },
          margin: {
            top: { value: 1, unit: "rem" },
            bottom: { value: 1, unit: "rem" },
            left: "auto",
            right: "auto",
          },
        },
      },
    ],
  },
  backgroundColorShortcut,
  fontFamilyShortcut as Shortcut<AllStylesSchemas>,
  colorShortcut,
];
