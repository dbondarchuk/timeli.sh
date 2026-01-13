import type React from "react";
import type { TextMark } from "../../lib/rich-text-types";

export function renderBold(
  content: React.ReactNode,
  marks: TextMark,
): React.ReactNode {
  if (marks.bold && !marks.fontWeight) {
    return <strong>{content}</strong>;
  }

  return content;
}
