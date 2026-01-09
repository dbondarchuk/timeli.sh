import type { TextMark } from "../../lib/rich-text-types";
import type { MarkPlugin } from "../types";
import { renderItalic } from "./render";

export const italicPlugin: MarkPlugin = {
  name: "italic",
  label: "Italic",
  type: "boolean",
  icon: "italic",
  keyboardShortcut: {
    key: "i",
    metaKey: true,
    ctrlKey: true,
  },
  apply: (context, value) => {
    context.applyFormat("italic", value);
  },
  isActive: (context) => {
    const activeMarks = context.getActiveMarks();
    return activeMarks.marks.italic !== undefined;
  },
  parseHTML: (element, marks) => {
    const style = element.style;
    const computedStyle = window.getComputedStyle(element);
    const result: Partial<TextMark> = {};

    // Italic
    if (
      element.tagName === "EM" ||
      element.tagName === "I" ||
      style.fontStyle === "italic" ||
      computedStyle.fontStyle === "italic"
    ) {
      result.italic = true;
    }

    return result;
  },
  render: renderItalic,
};
