"use client";

import { useClipboard } from "@vivid/ui";
import { useCallback, useMemo } from "react";
import { TEditorBlock } from "./core";

export const useBlockClipboard = (document?: Document) => {
  const { clipboardText, copyToClipboard: copyToClipboardBase } =
    useClipboard(document);

  const hasBlockClipboard = useMemo(() => {
    return clipboardText?.startsWith("block:");
  }, [clipboardText]);

  const clipboardBlock = useMemo(() => {
    if (!hasBlockClipboard) return null;
    return JSON.parse(clipboardText.slice(6)) as TEditorBlock;
  }, [hasBlockClipboard, clipboardText]);

  const copyToClipboard = useCallback(
    (block: TEditorBlock | null | undefined) => {
      if (block) {
        copyToClipboardBase(`block:${JSON.stringify(block)}`);
      }
    },
    [copyToClipboardBase],
  );

  return { hasBlockClipboard, copyToClipboard, clipboardBlock };
};
