import type { TextMark } from "../../lib/rich-text-types";
import type { MarkPlugin } from "../types";
import { renderSuperscript } from "./render";

export const superscriptPlugin: MarkPlugin = {
  name: "superscript",
  label: "Superscript",
  type: "boolean",
  inMoreMenu: true,
  apply: (context, value) => {
    context.applyFormat("superscript", value);
  },
  isActive: (context) => {
    const activeMarks = context.getActiveMarks();
    return activeMarks.marks.superscript !== undefined;
  },
  parseHTML: (element, marks) => {
    const result: Partial<TextMark> = {};

    // Superscript
    if (element.tagName === "SUP") {
      result.superscript = true;
    }

    return result;
  },
  render: renderSuperscript,
};
