"use client";

import { cn, mergeRefs } from "@timelish/ui";
import type React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type {
  DisabledFeatures,
  RichTextValue,
  TextMark,
  VariableData,
} from "../lib/rich-text-types";
import {
  adjustFontSizesInRange,
  adjustFontWeightsInRange,
  applyMarksToRange,
  getBlockPosition,
  getMarksInRange,
  getSelectionPositions,
  htmlToRichText,
  normalizeRichText,
  removeMarkFromRange,
  stringToRichText,
} from "../lib/rich-text-utils";
import { richTextToHtml } from "../styles/apply-text-styles";
import { FloatingToolbar } from "./floating-toolbar";
import { VariableAutocomplete } from "./variable-autocomplete";

interface EditableTextProps {
  value: RichTextValue | string;
  onChange: (value: RichTextValue) => void;
  placeholder?: string;
  className?: string;
  inline?: boolean;
  variables?: VariableData;
  disabledFeatures?: DisabledFeatures;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  documentElement?: Document;
  portalContainer?: string;
}

export const EditableText = forwardRef<HTMLDivElement, EditableTextProps>(
  (
    {
      value,
      onChange,
      placeholder = "Type something...",
      className = "",
      inline = false,
      variables,
      id,
      onClick,
      disabledFeatures = [],
      documentElement = document,
      portalContainer = "body",
    },
    ref,
  ) => {
    const defaultView = documentElement.defaultView ?? window;
    const editorRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const autocompleteRef = useRef<HTMLDivElement>(null);
    const savedSelectionRef = useRef<{ start: number; end: number } | null>(
      null,
    );
    const [showToolbar, setShowToolbar] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
    const [activeMarks, setActiveMarks] = useState<{
      marks: Partial<TextMark>;
      hasMixed: Set<keyof TextMark>;
    }>({
      marks: {},
      hasMixed: new Set(),
    });
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompletePosition, setAutocompletePosition] = useState({
      top: 0,
      left: 0,
    });
    const [variableQuery, setVariableQuery] = useState("");
    const [history, setHistory] = useState<RichTextValue[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const isUndoRedoRef = useRef(false);
    const lastValueRef = useRef<string>("");
    const popoverRefs = useRef<Set<HTMLElement>>(new Set());

    const richTextValue =
      typeof value === "string" ? stringToRichText(value) : value;

    useEffect(() => {
      const valueStr = JSON.stringify(richTextValue);

      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        lastValueRef.current = valueStr;
        return;
      }

      if (valueStr === lastValueRef.current) {
        return;
      }

      lastValueRef.current = valueStr;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(richTextValue);

      if (newHistory.length > 50) {
        newHistory.shift();
        setHistory(newHistory);
      } else {
        setHistory(newHistory);
        setHistoryIndex(historyIndex + 1);
      }
    }, [richTextValue]);

    const renderToHTML = useCallback(
      (blocks: RichTextValue): string => {
        return richTextToHtml(blocks, inline);
        // if (disableNewlines) {
        //   return blocks
        //     .map((block) =>
        //       block.content
        //         .map((node) => {
        //           const styles = applyTextStyles(node);
        //           let content: string = node.text;
        //           let styleStr = "";

        //           if (Object.keys(styles).length > 0) {
        //             styleStr = Object.entries(styles)
        //               .map(([key, val]) => {
        //                 const cssKey = key
        //                   .replace(/([A-Z])/g, "-$1")
        //                   .toLowerCase();
        //                 return `${cssKey}:${val}`;
        //               })
        //               .join(";");
        //           }

        //           if (node.marks) {
        //             if (node.marks.superscript)
        //               content = `<sup style="${styleStr}">${content}</sup>`;
        //             else if (node.marks.subscript)
        //               content = `<sub style="${styleStr}">${content}</sub>`;
        //             else if (node.marks.bold && !node.marks.fontWeight)
        //               content = `<strong style="${styleStr}">${content}</strong>`;
        //             else if (styleStr)
        //               content = `<span style="${styleStr}">${content}</span>`;

        //             if (node.marks.italic) content = `<em>${content}</em>`;
        //             if (node.marks.underline) content = `<u>${content}</u>`;
        //             if (node.marks.strikethrough) content = `<s>${content}</s>`;
        //           } else if (styleStr) {
        //             content = `<span style="${styleStr}">${content}</span>`;
        //           }

        //           return content;
        //         })
        //         .join("")
        //     )
        //     .join(" ");
        // }

        // return blocks
        //   .map((block) => {
        //     const content = block.content
        //       .map((node) => {
        //         const styles = applyTextStyles(node);
        //         let content: string = node.text || "<br>";
        //         let styleStr = "";

        //         if (Object.keys(styles).length > 0) {
        //           styleStr = Object.entries(styles)
        //             .map(([key, val]) => {
        //               const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        //               return `${cssKey}:${val}`;
        //             })
        //             .join(";");
        //         }

        //         if (node.marks) {
        //           if (node.marks.superscript)
        //             content = `<sup style="${styleStr}">${content}</sup>`;
        //           else if (node.marks.subscript)
        //             content = `<sub style="${styleStr}">${content}</sub>`;
        //           else if (node.marks.bold && !node.marks.fontWeight)
        //             content = `<strong style="${styleStr}">${content}</strong>`;
        //           else if (styleStr)
        //             content = `<span style="${styleStr}">${content}</span>`;

        //           if (node.marks.italic) content = `<em>${content}</em>`;
        //           if (node.marks.underline) content = `<u>${content}</u>`;
        //           if (node.marks.strikethrough) content = `<s>${content}</s>`;
        //         } else if (styleStr) {
        //           content = `<span style="${styleStr}">${content}</span>`;
        //         }

        //         return content;
        //       })
        //       .join("");

        //     return `<div>${content || "<br>"}</div>`;
        //   })
        //   .join("");
      },
      [inline],
    );

    const isUpdatingRef = useRef(false);

    useEffect(() => {
      if (!editorRef.current || isUpdatingRef.current) return;

      const expectedHTML = renderToHTML(richTextValue);
      const currentHTML = editorRef.current.innerHTML;

      if (currentHTML === expectedHTML) return;

      const selection = defaultView.getSelection();
      let savedRange: { start: number; end: number } | null = null;

      if (
        selection &&
        selection.rangeCount > 0 &&
        editorRef.current.contains(selection.anchorNode)
      ) {
        const range = selection.getRangeAt(0);
        savedRange = {
          start: getTextOffset(
            editorRef.current,
            range.startContainer,
            range.startOffset,
          ),
          end: getTextOffset(
            editorRef.current,
            range.endContainer,
            range.endOffset,
          ),
        };
      }

      isUpdatingRef.current = true;
      editorRef.current.innerHTML = expectedHTML;
      isUpdatingRef.current = false;

      if (savedRange && editorRef.current.firstChild) {
        try {
          const newRange = documentElement.createRange();
          const sel = defaultView.getSelection();
          setRangeFromOffset(
            editorRef.current,
            newRange,
            savedRange.start,
            savedRange.end,
          );
          sel?.removeAllRanges();
          sel?.addRange(newRange);
        } catch (e) {
          // Ignore cursor restoration errors
        }
      }
    }, [richTextValue, renderToHTML]);

    const parseHTMLToRichText = useCallback(
      (html: string): RichTextValue => {
        return htmlToRichText(html, defaultView);
      },
      [defaultView],
    );

    const getTextOffset = (root: Node, node: Node, offset: number): number => {
      let pos = 0;
      const walker = documentElement.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
      );

      let currentNode = walker.nextNode();
      while (currentNode) {
        if (currentNode === node) {
          return pos + offset;
        }
        pos += currentNode.textContent?.length || 0;
        currentNode = walker.nextNode();
      }

      return pos;
    };

    const setRangeFromOffset = (
      root: Node,
      range: Range,
      start: number,
      end: number,
    ) => {
      let pos = 0;
      const walker = documentElement.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
      );
      let startSet = false;
      let endSet = false;

      let currentNode = walker.nextNode();
      while (currentNode && !endSet) {
        const nodeLength = currentNode.textContent?.length || 0;

        if (!startSet && pos + nodeLength >= start) {
          range.setStart(currentNode, Math.min(start - pos, nodeLength));
          startSet = true;
        }

        if (startSet && pos + nodeLength >= end) {
          range.setEnd(currentNode, Math.min(end - pos, nodeLength));
          endSet = true;
        }

        pos += nodeLength;
        currentNode = walker.nextNode();
      }
    };

    const handleInput = useCallback(() => {
      if (!editorRef.current || isUpdatingRef.current) return;

      const html = editorRef.current.innerHTML;

      console.log(html);
      const newValue = parseHTMLToRichText(html);
      const normalized = normalizeRichText(newValue);

      onChange(normalized);

      setTimeout(() => detectVariableInput(), 0);
    }, [onChange, parseHTMLToRichText]);

    const detectVariableInput = useCallback(() => {
      if (!variables || !editorRef.current) return;

      const selection = defaultView.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const textBefore =
        range.startContainer.textContent?.slice(0, range.startOffset) || "";
      const lastOpenBrace = textBefore.lastIndexOf("{{");

      if (lastOpenBrace === -1) {
        setShowAutocomplete(false);
        return;
      }

      const textAfterBrace = textBefore.slice(lastOpenBrace + 2);
      const hasCloseBrace = textAfterBrace.includes("}}");

      if (!hasCloseBrace) {
        setVariableQuery(textAfterBrace);
        setShowAutocomplete(true);

        const rect = range.getBoundingClientRect();

        setAutocompletePosition({
          top: rect.bottom + defaultView.scrollY + 4,
          left: rect.left + defaultView.scrollX,
        });
      } else {
        setShowAutocomplete(false);
      }
    }, [variables]);

    const handleVariableSelect = useCallback(
      (variable: string) => {
        if (!editorRef.current) return;

        const selection = defaultView.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const textContent = editorRef.current.textContent || "";
        const range = selection.getRangeAt(0);
        const cursorPos = getTextOffset(
          editorRef.current,
          range.startContainer,
          range.startOffset,
        );

        const textBefore = textContent.slice(0, cursorPos);
        const lastOpenBrace = textBefore.lastIndexOf("{{");

        if (lastOpenBrace === -1) return;

        const beforeBrace = textContent.slice(0, lastOpenBrace);
        const afterCursor = textContent.slice(cursorPos);
        const newText = `${beforeBrace}{{${variable}}}${afterCursor}`;

        editorRef.current.textContent = newText;
        handleInput();

        const newCursorPos = lastOpenBrace + variable.length + 4;
        setTimeout(() => {
          const textNode = editorRef.current?.firstChild;
          if (textNode) {
            const newRange = documentElement.createRange();
            const sel = defaultView.getSelection();
            newRange.setStart(
              textNode,
              Math.min(newCursorPos, (textNode.textContent || "").length),
            );
            newRange.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(newRange);
          }
        }, 0);

        setShowAutocomplete(false);
      },
      [handleInput],
    );

    const recalculateActiveMarksInRange = useCallback(
      (
        richTextValue: RichTextValue,
        startBlock: number,
        startOffset: number,
        endBlock: number,
        endOffset: number,
      ) => {
        const marksInfo = getMarksInRange(
          richTextValue,
          startBlock,
          startOffset,
          endBlock,
          endOffset,
        );

        setActiveMarks(marksInfo);
      },
      [setActiveMarks],
    );

    const saveSelection = useCallback(() => {
      if (!editorRef.current) return;

      const selection = defaultView.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const start = getTextOffset(
        editorRef.current,
        range.startContainer,
        range.startOffset,
      );
      const end = getTextOffset(
        editorRef.current,
        range.endContainer,
        range.endOffset,
      );

      savedSelectionRef.current = { start, end };
    }, []);

    const restoreSelection = useCallback(() => {
      if (!editorRef.current || !savedSelectionRef.current)
        return Promise.resolve();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const sel = defaultView.getSelection();
          if (sel && editorRef.current) {
            const newRange = documentElement.createRange();
            setRangeFromOffset(
              editorRef.current,
              newRange,
              savedSelectionRef.current!.start,
              savedSelectionRef.current!.end,
            );
            sel.removeAllRanges();
            sel.addRange(newRange);
          }
          resolve();
        }, 0);
      });
    }, []);

    const handleSelectionChange = useCallback(() => {
      if (!editorRef.current?.contains(documentElement.activeElement)) return;

      const selection = defaultView.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setShowToolbar(false);
        return;
      }

      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        setShowToolbar(false);
        return;
      }

      const { startPos, endPos } = getSelectionPositions(
        editorRef.current,
        richTextValue,
        defaultView,
      );

      if (startPos.blockIndex === -1 || endPos.blockIndex === -1) {
        setShowToolbar(false);
        return;
      }

      const marksInfo = getMarksInRange(
        richTextValue,
        startPos.blockIndex,
        startPos.offset,
        endPos.blockIndex,
        endPos.offset,
      );
      setActiveMarks(marksInfo);
      saveSelection();
      setShowToolbar(true);

      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top + defaultView.scrollY - 50,
        left: rect.left + defaultView.scrollX + rect.width / 2,
      });
    }, [richTextValue, saveSelection, defaultView]);

    useEffect(() => {
      documentElement.addEventListener(
        "selectionchange",
        handleSelectionChange,
      );

      return () => {
        documentElement.removeEventListener(
          "selectionchange",
          handleSelectionChange,
        );
      };
    }, [handleSelectionChange, defaultView]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;

        // Check if click is inside any registered popover
        let isInsidePopover = false;
        popoverRefs.current.forEach((popoverEl) => {
          if (popoverEl.contains(target)) {
            isInsidePopover = true;
            e.stopPropagation();
          }
        });

        if (
          editorRef.current &&
          !editorRef.current.contains(target) &&
          toolbarRef.current &&
          !toolbarRef.current.contains(target) &&
          !isInsidePopover &&
          (!autocompleteRef.current ||
            !autocompleteRef.current.contains(target))
        ) {
          setShowToolbar(false);
          setShowAutocomplete(false);
        }
      };

      documentElement.addEventListener("mousedown", handleClickOutside);
      return () =>
        documentElement.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const applyFormat = useCallback(
      (type: keyof TextMark, value?: string | number | boolean | "inherit") => {
        const selection = defaultView.getSelection();
        if (!selection || selection.rangeCount === 0 || !editorRef.current)
          return;

        const range = selection.getRangeAt(0);
        const start = getTextOffset(
          editorRef.current,
          range.startContainer,
          range.startOffset,
        );
        const end = getTextOffset(
          editorRef.current,
          range.endContainer,
          range.endOffset,
        );

        if (start === end) return;

        const startPos = getBlockPosition(richTextValue, start);
        const endPos = getBlockPosition(richTextValue, end);

        let newValue: RichTextValue;

        if (value === "inherit") {
          newValue = removeMarkFromRange(
            richTextValue,
            startPos.blockIndex,
            startPos.offset,
            endPos.blockIndex,
            endPos.offset,
            type,
          );
        } else if (typeof value === "boolean") {
          if (activeMarks.marks[type]) {
            newValue = removeMarkFromRange(
              richTextValue,
              startPos.blockIndex,
              startPos.offset,
              endPos.blockIndex,
              endPos.offset,
              type,
            );
          } else {
            newValue = applyMarksToRange(
              richTextValue,
              startPos.blockIndex,
              startPos.offset,
              endPos.blockIndex,
              endPos.offset,
              { [type]: true },
            );
          }
        } else if (value !== undefined) {
          newValue = applyMarksToRange(
            richTextValue,
            startPos.blockIndex,
            startPos.offset,
            endPos.blockIndex,
            endPos.offset,
            { [type]: value },
          );
        } else {
          if (activeMarks.marks[type]) {
            newValue = removeMarkFromRange(
              richTextValue,
              startPos.blockIndex,
              startPos.offset,
              endPos.blockIndex,
              endPos.offset,
              type,
            );
          } else {
            newValue = applyMarksToRange(
              richTextValue,
              startPos.blockIndex,
              startPos.offset,
              endPos.blockIndex,
              endPos.offset,
              { [type]: true },
            );
          }
        }

        onChange(normalizeRichText(newValue));
      },
      [richTextValue, activeMarks, onChange],
    );

    const handleFormat = useCallback(
      async (
        type: keyof TextMark,
        value?: string | number | boolean | "inherit",
      ) => {
        await restoreSelection();
        applyFormat(type, value);
      },
      [applyFormat, restoreSelection],
    );

    const handleClearFormat = useCallback(async () => {
      await restoreSelection();
      const selection = defaultView.getSelection();
      if (!selection || selection.rangeCount === 0 || !editorRef.current)
        return;

      const range = selection.getRangeAt(0);
      const start = getTextOffset(
        editorRef.current,
        range.startContainer,
        range.startOffset,
      );
      const end = getTextOffset(
        editorRef.current,
        range.endContainer,
        range.endOffset,
      );

      if (start === end) return;

      const startPos = getBlockPosition(richTextValue, start);
      const endPos = getBlockPosition(richTextValue, end);

      const newValue = richTextValue.map((block, blockIndex) => {
        if (
          blockIndex < startPos.blockIndex ||
          blockIndex > endPos.blockIndex
        ) {
          return block;
        }

        const blockLength = block.content.reduce(
          (sum, node) => sum + node.text.length,
          0,
        );
        const rangeStart =
          blockIndex === startPos.blockIndex ? startPos.offset : 0;
        const rangeEnd =
          blockIndex === endPos.blockIndex ? endPos.offset : blockLength;

        const result: typeof block.content = [];
        let currentPos = 0;

        for (const node of block.content) {
          const nodeEnd = currentPos + node.text.length;

          if (nodeEnd <= rangeStart || currentPos >= rangeEnd) {
            result.push(node);
          } else if (currentPos >= rangeStart && nodeEnd <= rangeEnd) {
            result.push({ text: node.text });
          } else {
            if (currentPos < rangeStart) {
              result.push({
                text: node.text.slice(0, rangeStart - currentPos),
                marks: node.marks,
              });
            }

            const selectionStart = Math.max(0, rangeStart - currentPos);
            const selectionEnd = Math.min(
              node.text.length,
              rangeEnd - currentPos,
            );

            result.push({
              text: node.text.slice(selectionStart, selectionEnd),
            });

            if (nodeEnd > rangeEnd) {
              result.push({
                text: node.text.slice(rangeEnd - currentPos),
                marks: node.marks,
              });
            }
          }

          currentPos = nodeEnd;
        }

        return { ...block, content: result };
      });

      onChange(normalizeRichText(newValue));
    }, [richTextValue, onChange, restoreSelection]);

    const handleFontSizeChange = useCallback(
      async (size: number | "inherit") => {
        await restoreSelection();
        applyFormat("fontSize", size);
      },
      [applyFormat, restoreSelection],
    );

    const handleFontSizeAdjust = useCallback(
      async (delta: number) => {
        await restoreSelection();
        const selection = defaultView.getSelection();
        if (!selection || selection.rangeCount === 0 || !editorRef.current)
          return;

        const range = selection.getRangeAt(0);
        const start = getTextOffset(
          editorRef.current,
          range.startContainer,
          range.startOffset,
        );
        const end = getTextOffset(
          editorRef.current,
          range.endContainer,
          range.endOffset,
        );

        const startPos = getBlockPosition(richTextValue, start);
        const endPos = getBlockPosition(richTextValue, end);

        const newValue = adjustFontSizesInRange(
          richTextValue,
          startPos.blockIndex,
          startPos.offset,
          endPos.blockIndex,
          endPos.offset,
          delta,
        );
        recalculateActiveMarksInRange(
          newValue,
          startPos.blockIndex,
          startPos.offset,
          endPos.blockIndex,
          endPos.offset,
        );
        onChange(normalizeRichText(newValue));
      },
      [
        richTextValue,
        onChange,
        restoreSelection,
        recalculateActiveMarksInRange,
      ],
    );

    const handleFontWeightAdjust = useCallback(
      (delta: number) => {
        const selection = defaultView.getSelection();
        if (!selection || selection.rangeCount === 0 || !editorRef.current)
          return;

        const range = selection.getRangeAt(0);
        const start = getTextOffset(
          editorRef.current,
          range.startContainer,
          range.startOffset,
        );
        const end = getTextOffset(
          editorRef.current,
          range.endContainer,
          range.endOffset,
        );

        const startPos = getBlockPosition(richTextValue, start);
        const endPos = getBlockPosition(richTextValue, end);

        const newValue = adjustFontWeightsInRange(
          richTextValue,
          startPos.blockIndex,
          startPos.offset,
          endPos.blockIndex,
          endPos.offset,
          delta,
        );
        onChange(normalizeRichText(newValue));
      },
      [richTextValue, onChange],
    );

    const handleUndo = useCallback(() => {
      if (historyIndex > 0) {
        isUndoRedoRef.current = true;
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        onChange(history[newIndex]);
      }
    }, [historyIndex, history, onChange]);

    const handleRedo = useCallback(() => {
      if (historyIndex < history.length - 1) {
        isUndoRedoRef.current = true;
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        onChange(history[newIndex]);
      }
    }, [historyIndex, history, onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (inline && e.key === "Enter") {
          e.preventDefault();
          return;
        }

        if ((e.metaKey || e.ctrlKey) && !e.altKey) {
          if (e.shiftKey && e.key.toLowerCase() === "z") {
            e.preventDefault();
            handleRedo();
            return;
          }

          switch (e.key.toLowerCase()) {
            case "z":
              e.preventDefault();
              handleUndo();
              break;
            case "b":
              e.preventDefault();
              handleFormat("bold");
              break;
            case "i":
              e.preventDefault();
              handleFormat("italic");
              break;
            case "u":
              e.preventDefault();
              handleFormat("underline");
              break;
          }
        }
      },
      [inline, handleUndo, handleRedo, handleFormat],
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        e.preventDefault();
        const html = e.clipboardData.getData("text/html");
        const text = e.clipboardData.getData("text/plain");

        if (html) {
          const parsed = parseHTMLToRichText(html);
          const selection = defaultView.getSelection();
          if (selection && selection.rangeCount > 0 && editorRef.current) {
            const range = selection.getRangeAt(0);
            range.deleteContents();

            const fragment = documentElement.createDocumentFragment();
            const div = documentElement.createElement("div");
            div.innerHTML = renderToHTML(parsed);
            while (div.firstChild) {
              fragment.appendChild(div.firstChild);
            }
            range.insertNode(fragment);

            handleInput();
          }
        } else if (text) {
          documentElement.execCommand("insertText", false, text);
        }
      },
      [parseHTMLToRichText, renderToHTML, handleInput],
    );

    const Component = inline ? "span" : "div";

    const registerPopoverRef = useCallback((element: HTMLElement | null) => {
      if (element) {
        popoverRefs.current.add(element);
      }
      return () => {
        if (element) {
          popoverRefs.current.delete(element);
        }
      };
    }, []);

    useEffect(() => {
      if (!editorRef.current || !savedSelectionRef.current) return;

      const renderSelectionHighlight = () => {
        // Remove existing highlights
        editorRef.current
          ?.querySelectorAll(".custom-selection-highlight")
          .forEach((el) => el.remove());

        // Only show custom highlight if popovers have focus
        if (
          documentElement.activeElement &&
          !(
            popoverRefs.current.size > 0 &&
            Array.from(popoverRefs.current).some((el) =>
              el.contains(documentElement.activeElement),
            )
          )
        )
          return;

        const selection = savedSelectionRef.current;
        if (!selection || !editorRef.current) return;

        const newRange = documentElement.createRange();
        setRangeFromOffset(
          editorRef.current,
          newRange,
          selection.start,
          selection.end,
        );

        const rects = newRange.getClientRects();

        Array.from(rects).forEach((rect) => {
          const highlight = documentElement.createElement("div");
          highlight.className = "custom-selection-highlight";
          highlight.style.cssText = `
          position: absolute;
          background-color: rgb(59 130 246 / 0.1);
          pointer-events: none;
          z-index: 1;
          top: ${rect.top + defaultView.scrollY}px;
          left: ${rect.left + defaultView.scrollX}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
        `;
          documentElement.body.appendChild(highlight);
        });
      };

      renderSelectionHighlight();

      // Re-render on scroll or resize
      const handleUpdate = () => renderSelectionHighlight();
      defaultView.addEventListener("scroll", handleUpdate, true);
      defaultView.addEventListener("resize", handleUpdate);
      defaultView.addEventListener("focusin", handleUpdate);

      return () => {
        editorRef.current
          ?.querySelectorAll(".custom-selection-highlight")
          .forEach((el) => el.remove());
        documentElement.body
          .querySelectorAll(".custom-selection-highlight")
          .forEach((el) => el.remove());
        defaultView.removeEventListener("scroll", handleUpdate, true);
        defaultView.removeEventListener("resize", handleUpdate);
        defaultView.removeEventListener("focusin", handleUpdate);
      };
    }, [showToolbar, savedSelectionRef.current]);

    const portalContainerElement = useMemo(() => {
      if (portalContainer === "body") {
        return documentElement.body;
      }

      return (
        documentElement.querySelector(portalContainer) ?? documentElement.body
      );
    }, [portalContainer, documentElement]);

    return (
      <>
        <Component
          ref={mergeRefs(ref, editorRef)}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={cn(`outline-none focus:outline-none`, className)}
          data-placeholder={placeholder}
          id={id}
          onClick={onClick}
        />

        {showToolbar &&
          typeof defaultView !== "undefined" &&
          createPortal(
            <div ref={toolbarRef}>
              <FloatingToolbar
                position={toolbarPosition}
                activeMarks={activeMarks.marks}
                hasMixed={activeMarks.hasMixed}
                onFormat={handleFormat}
                onFontSizeChange={handleFontSizeChange}
                onFontSizeAdjust={handleFontSizeAdjust}
                disabledFeatures={disabledFeatures}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onClearFormat={handleClearFormat}
                registerPopoverRef={registerPopoverRef}
              />
            </div>,
            portalContainerElement,
          )}

        {showAutocomplete &&
          variables &&
          typeof defaultView !== "undefined" &&
          createPortal(
            <div ref={autocompleteRef}>
              <VariableAutocomplete
                position={autocompletePosition}
                query={variableQuery}
                variables={variables}
                onSelect={handleVariableSelect}
                onClose={() => setShowAutocomplete(false)}
                documentElement={documentElement}
              />
            </div>,
            portalContainerElement,
          )}
      </>
    );
  },
);
