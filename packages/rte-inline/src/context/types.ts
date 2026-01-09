import type {
  RichTextValue,
  TextMark,
  VariableData,
} from "../lib/rich-text-types";

export interface SelectionPosition {
  blockIndex: number;
  offset: number;
}

export interface SelectionRange {
  start: SelectionPosition;
  end: SelectionPosition;
}

export interface RTEContextValue {
  // Core methods
  applyFormat: (
    type: keyof TextMark,
    value?: string | number | boolean | "inherit",
  ) => void;
  getSelection: () => SelectionRange | null;
  getActiveMarks: () => {
    marks: Partial<TextMark>;
    hasMixed: Set<keyof TextMark>;
  };
  clearFormat: () => void;

  // Editor state
  value: RichTextValue;
  onChange: (value: RichTextValue) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  defaultView: Window;
  documentElement: Document;

  // Variables
  variables?: VariableData;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Selection management
  saveSelection: () => void;
  restoreSelection: () => Promise<void>;

  // Configuration
  disabledFeatures?: (keyof TextMark | "clearFormat" | "undo" | "redo")[];
  registerPopoverRef?: (element: HTMLElement | null) => () => void;
}
