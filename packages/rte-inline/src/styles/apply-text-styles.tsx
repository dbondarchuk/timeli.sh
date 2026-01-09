import type React from "react";
// @ts-ignore It's there but not typed
import { renderToStaticMarkup } from "react-dom/server.browser";
import type { RichTextValue, TextMark, TextNode } from "../lib/rich-text-types";
import { pluginRegistry } from "../plugins";

export function applyTextStyles(node: TextNode): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (!node.marks) {
    return styles;
  }

  // Collect styles from all plugins
  const plugins = pluginRegistry.getAll();
  for (const plugin of plugins) {
    if (plugin.getStyles && node.marks[plugin.name]) {
      const pluginStyles = plugin.getStyles(node.marks);
      Object.assign(styles, pluginStyles);
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

  // Apply styles first if there are any
  if (Object.keys(styles).length > 0) {
    content = <span style={styles}>{content}</span>;
  }

  // Apply element wrappers from plugins
  // Order: structural elements (subscript/superscript) first, then text decorations
  const plugins = pluginRegistry.getAll();

  // First pass: structural elements (subscript/superscript)
  for (const plugin of plugins) {
    if (
      plugin.render &&
      (plugin.name === "superscript" || plugin.name === "subscript")
    ) {
      if (marks[plugin.name]) {
        content = plugin.render(content, marks);
      }
    }
  }

  // Second pass: text decoration elements
  for (const plugin of plugins) {
    if (
      plugin.render &&
      plugin.name !== "superscript" &&
      plugin.name !== "subscript" &&
      marks[plugin.name]
    ) {
      content = plugin.render(content, marks);
    }
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
