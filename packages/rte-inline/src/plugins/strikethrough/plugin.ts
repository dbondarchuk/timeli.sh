import type { TextMark } from "../../lib/rich-text-types";
import type { MarkPlugin } from "../types";
import { renderStrikethrough } from "./render";

export const strikethroughPlugin: MarkPlugin = {
  name: "strikethrough",
  label: "Strikethrough",
  type: "boolean",
  inMoreMenu: true,
  apply: (context, value) => {
    context.applyFormat("strikethrough", value);
  },
  isActive: (context) => {
    const activeMarks = context.getActiveMarks();
    return activeMarks.marks.strikethrough !== undefined;
  },
  parseHTML: (element, marks) => {
    const style = element.style;
    const computedStyle = window.getComputedStyle(element);
    const result: Partial<TextMark> = {};

    // Strikethrough
    if (
      element.tagName === "S" ||
      element.tagName === "STRIKE" ||
      style.textDecoration?.includes("line-through") ||
      computedStyle.textDecoration.includes("line-through")
    ) {
      result.strikethrough = true;
    }

    return result;
  },
  render: renderStrikethrough,
};
