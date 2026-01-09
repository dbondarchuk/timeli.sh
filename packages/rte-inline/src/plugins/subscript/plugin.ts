import type { TextMark } from "../../lib/rich-text-types";
import type { MarkPlugin } from "../types";
import { renderSubscript } from "./render";

export const subscriptPlugin: MarkPlugin = {
  name: "subscript",
  label: "Subscript",
  type: "boolean",
  inMoreMenu: true,
  apply: (context, value) => {
    context.applyFormat("subscript", value);
  },
  isActive: (context) => {
    const activeMarks = context.getActiveMarks();
    return activeMarks.marks.subscript !== undefined;
  },
  parseHTML: (element, marks) => {
    const result: Partial<TextMark> = {};

    // Subscript
    if (element.tagName === "SUB") {
      result.subscript = true;
    }

    return result;
  },
  render: renderSubscript,
};
