import type { RTEContextValue } from "../context/types";
import type { TextMark } from "../lib/rich-text-types";

export interface MarkPlugin {
  name: keyof TextMark;
  label: string;
  type: "boolean" | "color" | "select" | "number";
  icon?: string;
  options?: Array<{ value: any; label: string; preview?: string }>;
  defaultValue?: any;
  inMoreMenu?: boolean;

  // Plugin-specific methods
  apply?: (
    context: RTEContextValue,
    value?: string | number | boolean | "inherit",
  ) => void;
  isActive?: (context: RTEContextValue) => boolean;
  keyboardShortcut?: {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  };

  // HTML parsing: how to parse this mark from HTML
  parseHTML?: (element: HTMLElement, marks: TextMark) => Partial<TextMark>;

  // Rendering: get CSS styles for this mark
  getStyles?: (marks: Partial<TextMark>) => React.CSSProperties;

  // Rendering: wrap content with HTML elements for this mark
  render?: (
    content: React.ReactNode,
    marks: Partial<TextMark>,
  ) => React.ReactNode;
}

export interface PluginRegistry {
  plugins: Map<keyof TextMark, MarkPlugin>;
  register: (plugin: MarkPlugin) => void;
  get: (name: keyof TextMark) => MarkPlugin | undefined;
  getAll: () => MarkPlugin[];
}
