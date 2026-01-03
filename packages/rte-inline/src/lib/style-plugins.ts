import type { StylePluginConfig, TextMark } from "./rich-text-types"

export const stylePlugins: StylePluginConfig[] = [
  {
    name: "bold",
    label: "Bold",
    type: "boolean",
    icon: "bold",
  },
  {
    name: "italic",
    label: "Italic",
    type: "boolean",
    icon: "italic",
  },
  {
    name: "underline",
    label: "Underline",
    type: "boolean",
    icon: "underline",
  },
  {
    name: "fontSize",
    label: "Font Size",
    type: "number",
    defaultValue: 16,
    options: [
      { value: "inherit", label: "Inherit" },
      { value: 12, label: "12px" },
      { value: 14, label: "14px" },
      { value: 16, label: "16px" },
      { value: 18, label: "18px" },
      { value: 20, label: "20px" },
      { value: 24, label: "24px" },
      { value: 28, label: "28px" },
      { value: 32, label: "32px" },
      { value: 36, label: "36px" },
      { value: 48, label: "48px" },
    ],
  },
  {
    name: "fontFamily",
    label: "Font Family",
    type: "select",
    options: [
      { value: "inherit", label: "Inherit" },
      { value: "Inter, sans-serif", label: "Inter" },
      { value: "Georgia, serif", label: "Georgia" },
      { value: "Courier New, monospace", label: "Courier New" },
      { value: "Arial, sans-serif", label: "Arial" },
      { value: "Times New Roman, serif", label: "Times New Roman" },
      { value: "Helvetica, sans-serif", label: "Helvetica" },
    ],
  },
  {
    name: "fontWeight",
    label: "Font Weight",
    type: "select",
    options: [
      { value: "inherit", label: "Inherit" },
      { value: 100, label: "Thin", preview: "100" },
      { value: 200, label: "Extra Light", preview: "200" },
      { value: 300, label: "Light", preview: "300" },
      { value: 400, label: "Normal", preview: "400" },
      { value: 500, label: "Medium", preview: "500" },
      { value: 600, label: "Semi Bold", preview: "600" },
      { value: 700, label: "Bold", preview: "700" },
      { value: 800, label: "Extra Bold", preview: "800" },
      { value: 900, label: "Black", preview: "900" },
    ],
  },
  {
    name: "color",
    label: "Text Color",
    type: "color",
  },
  {
    name: "backgroundColor",
    label: "Background Color",
    type: "color",
  },
  {
    name: "strikethrough",
    label: "Strikethrough",
    type: "boolean",
    inMoreMenu: true,
  },
  {
    name: "superscript",
    label: "Superscript",
    type: "boolean",
    inMoreMenu: true,
  },
  {
    name: "subscript",
    label: "Subscript",
    type: "boolean",
    inMoreMenu: true,
  },
  {
    name: "letterSpacing",
    label: "Letter Spacing",
    type: "select",
    inMoreMenu: true,
    options: [
      { value: "inherit", label: "Inherit" },
      { value: "tight", label: "Tight" },
      { value: "normal", label: "Normal" },
      { value: "wide", label: "Wide" },
    ],
  },
  {
    name: "textTransform",
    label: "Text Transform",
    type: "select",
    inMoreMenu: true,
    options: [
      { value: "inherit", label: "Inherit" },
      { value: "none", label: "None" },
      { value: "uppercase", label: "Uppercase" },
      { value: "lowercase", label: "Lowercase" },
      { value: "capitalize", label: "Capitalize" },
    ],
  },
  {
    name: "lineHeight",
    label: "Line Height",
    type: "select",
    inMoreMenu: true,
    options: [
      { value: "inherit", label: "Inherit" },
      { value: 1, label: "Tight", preview: "1" },
      { value: 1.25, label: "Snug", preview: "1.25" },
      { value: 1.5, label: "Normal", preview: "1.5" },
      { value: 1.75, label: "Relaxed", preview: "1.75" },
      { value: 2, label: "Loose", preview: "2" },
    ],
  },
]

export function getPluginByName(name: keyof TextMark): StylePluginConfig | undefined {
  return stylePlugins.find((p) => p.name === name)
}
