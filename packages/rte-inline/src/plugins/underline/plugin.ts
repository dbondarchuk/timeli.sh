import type { TextMark } from "../../lib/rich-text-types";
import type { MarkPlugin } from "../types";
import { renderUnderline } from "./render";

export const underlinePlugin: MarkPlugin = {
  name: "underline",
  label: "Underline",
  type: "boolean",
  icon: "underline",
  keyboardShortcut: {
    key: "u",
    metaKey: true,
    ctrlKey: true,
  },
  apply: (context, value) => {
    context.applyFormat("underline", value);
  },
  isActive: (context) => {
    const activeMarks = context.getActiveMarks();
    return activeMarks.marks.underline !== undefined;
  },
  parseHTML: (element, marks) => {
    const style = element.style;
    const computedStyle = window.getComputedStyle(element);
    const result: Partial<TextMark> = {};

    // Underline
    if (
      element.tagName === "U" ||
      style.textDecoration?.includes("underline") ||
      computedStyle.textDecoration.includes("underline")
    ) {
      result.underline = true;
    }

    return result;
  },
  render: renderUnderline,
};
