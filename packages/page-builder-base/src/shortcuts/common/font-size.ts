import { CaseSensitive } from "lucide-react";
import { AllStylesSchemas } from "../../style";
import { Shortcut } from "../types";

/** Tailwind CSS default `text-*` font-size and line-height pairs (v3). */
export const TEXT_SIZE_PRESETS = [
  {
    key: "xs",
    fontSize: { value: 0.75, unit: "rem" as const },
    lineHeight: { value: 1, unit: "rem" as const },
  },
  {
    key: "sm",
    fontSize: { value: 0.875, unit: "rem" as const },
    lineHeight: { value: 1.25, unit: "rem" as const },
  },
  {
    key: "base",
    fontSize: { value: 1, unit: "rem" as const },
    lineHeight: { value: 1.5, unit: "rem" as const },
  },
  {
    key: "lg",
    fontSize: { value: 1.125, unit: "rem" as const },
    lineHeight: { value: 1.75, unit: "rem" as const },
  },
  {
    key: "xl",
    fontSize: { value: 1.25, unit: "rem" as const },
    lineHeight: { value: 1.75, unit: "rem" as const },
  },
  {
    key: "2xl",
    fontSize: { value: 1.5, unit: "rem" as const },
    lineHeight: { value: 2, unit: "rem" as const },
  },
  {
    key: "3xl",
    fontSize: { value: 1.875, unit: "rem" as const },
    lineHeight: { value: 2.25, unit: "rem" as const },
  },
  {
    key: "4xl",
    fontSize: { value: 2.25, unit: "rem" as const },
    lineHeight: { value: 2.5, unit: "rem" as const },
  },
] as const;

export const fontSizeShortcut: Shortcut<
  Pick<AllStylesSchemas, "fontSize" | "lineHeight">
> = {
  label: "builder.pageBuilder.shortcuts.fontSize.label",
  icon: CaseSensitive,
  options: TEXT_SIZE_PRESETS.map((preset) => ({
    label: `builder.pageBuilder.shortcuts.fontSize.options.${preset.key}`,
    value: preset.key,
    targetStyles: {
      fontSize: preset.fontSize,
      lineHeight: preset.lineHeight,
    },
  })),
};
