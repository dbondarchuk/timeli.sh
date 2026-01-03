import type React from "react";
// @ts-ignore It's there but not typed
import { renderToStaticMarkup } from "react-dom/server.browser";
import type { RichTextValue, TextMark, TextNode } from "../lib/rich-text-types";

export function applyTextStyles(node: TextNode): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (node.marks) {
    if (node.marks.color && node.marks.color !== "inherit") {
      styles.color = node.marks.color;
    }
    if (
      node.marks.backgroundColor &&
      node.marks.backgroundColor !== "inherit"
    ) {
      styles.backgroundColor = node.marks.backgroundColor;
    }
    if (node.marks.fontSize && node.marks.fontSize !== "inherit") {
      styles.fontSize = `${node.marks.fontSize}px`;
    }
    if (node.marks.fontFamily && node.marks.fontFamily !== "inherit") {
      styles.fontFamily = node.marks.fontFamily;
    }
    if (node.marks.fontWeight && node.marks.fontWeight !== "inherit") {
      styles.fontWeight = node.marks.fontWeight;
    }
    if (node.marks.letterSpacing && node.marks.letterSpacing !== "inherit") {
      const spacingMap = { tight: "-0.025em", normal: "0em", wide: "0.05em" };
      styles.letterSpacing = spacingMap[node.marks.letterSpacing];
    }
    if (node.marks.textTransform && node.marks.textTransform !== "inherit") {
      styles.textTransform = node.marks.textTransform;
    }
    if (node.marks.lineHeight && node.marks.lineHeight !== "inherit") {
      styles.lineHeight = node.marks.lineHeight;
    }
  }

  return styles;
}

export function wrapWithMarkElements(
  text: string,
  marks: TextMark | undefined,
  styles: React.CSSProperties,
): React.ReactNode {
  let content: React.ReactNode = text;

  if (!marks) {
    return Object.keys(styles).length > 0 ? (
      <span style={styles}>{content}</span>
    ) : (
      content
    );
  }

  // Apply structural elements first
  if (marks.superscript) {
    content = <sup style={styles}>{content}</sup>;
  } else if (marks.subscript) {
    content = <sub style={styles}>{content}</sub>;
  } else if (Object.keys(styles).length > 0) {
    content = <span style={styles}>{content}</span>;
  }

  // Apply text decoration elements
  if (marks.bold && !marks.fontWeight) {
    content = <strong style={styles}>{content}</strong>;
  }
  if (marks.italic) {
    content = <em style={styles}>{content}</em>;
  }
  if (marks.underline) {
    content = <u style={styles}>{content}</u>;
  }
  if (marks.strikethrough) {
    content = <s style={styles}>{content}</s>;
  }

  return content;
}

export function richTextToHtml(value: RichTextValue, inline = false): string {
  const blocks = value.map((block) =>
    block.content.map((node) => {
      const styles = applyTextStyles(node);
      const content = wrapWithMarkElements(node.text, node.marks, styles);
      return content;
    }),
  );

  const blocksHtml = blocks
    .map((block) => renderToStaticMarkup(block))
    .map((block) => (inline ? block : `<div>${block || "<br>"}</div>`))
    .join(inline ? " " : "");

  return blocksHtml;
}
